# Nudge Handling Backend Changes - Frontend Update Guide

## Summary
The backend nudge system has been updated to process nudges on-demand via Server-Sent Events (SSE) connections. Nudges are only triggered when users are actively connected, ensuring efficient resource usage and real-time delivery. The frontend should update to use SSE for nudge notifications.

## Key Changes

### 1. **Nudges Now Store Messages and Trigger Timestamps**
- **Change**: When a nudge is triggered, the generated AI message is stored in the database along with a `triggeredAt` timestamp
- **Impact**: Nudges returned from API calls now include a `message` field and `triggeredAt` timestamp
- **NudgeDoc Structure**:
  ```typescript
  {
    _id: string,
    user: string,
    task: string,
    deliveryTime: Date,  // When the nudge was scheduled to be delivered
    triggeredAt: Date | null,  // When the nudge was actually triggered (null if not yet triggered)
    message?: string  // AI-generated message, present when triggered
  }
  ```
- **Note**: The `triggered: boolean` field has been replaced with `triggeredAt: Date | null` for more accurate tracking

### 2. **SSE-Based Nudge Triggering**
- **Change**: Nudges are now triggered on-demand through SSE connections, not via background processing
- **Impact**: Nudges are only generated when users are actively connected, saving resources
- **Architecture**: 
  - **SSE endpoint** handles both triggering and delivering nudges
  - Nudges are triggered when users connect (backlog) and polled every 5 seconds while connected
  - When a user disconnects or logs out, nudge processing stops immediately
  - No background scheduler - all processing happens through active SSE connections
- **Frontend Action**: Connect to SSE endpoint to receive nudges in real-time

### 3. **Server-Sent Events (SSE) Endpoint**
- **New Endpoint**: `GET /api/nudges/stream?accessToken=<token>`
- **Purpose**: Real-time nudge notifications for connected clients
- **Authentication**: Access token via query parameter or `Authorization: Bearer <token>` header

### 4. **Backlog Processing on Connection**
- **Change**: When connecting via SSE, the system automatically processes all ready nudges since the user's last connection
- **Impact**: Clients catch up on missed nudges when reconnecting, and ready nudges are triggered immediately
- **Implementation**: 
  - Tracks `lastSeenNudgeTimestamp` per user (when the last nudge was sent)
  - On connect, gets all ready nudges with `deliveryTime > lastSeenNudgeTimestamp`
  - Triggers and sends these nudges immediately
  - Also sends any already-triggered nudges that weren't received (in case of disconnection)

## Frontend Implementation Guide

### Option 1: Use SSE for Real-Time Notifications (Recommended)

```javascript
// Connect to SSE stream
const eventSource = new EventSource(`/api/nudges/stream?accessToken=${accessToken}`);

// Handle connection
eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'connected':
      console.log('Connected to nudge stream');
      // Backlog of ready nudges will be triggered and sent immediately
      // Any already-triggered nudges since last connection will also be sent
      break;
      
    case 'nudge':
      // Display the nudge to the user
      // Note: This nudge was just triggered and the message was generated
      showNudgeNotification({
        nudgeId: data.nudge._id,
        taskId: data.nudge.task,
        message: data.nudge.message,  // AI-generated message
        deliveryTime: data.nudge.deliveryTime,  // When nudge was scheduled
      });
      break;
      
    case 'heartbeat':
      // Connection is alive (every 30 seconds)
      break;
      
    case 'error':
      console.error('SSE error:', data.message);
      break;
  }
});

// Handle connection errors
eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  // Optionally implement reconnection logic
};

// Close connection when done
// eventSource.close();
```

**Benefits:**
- Real-time delivery (no polling delay)
- Automatic catch-up on missed notifications
- Efficient (only sends when nudges are ready)

### Option 2: Poll for Triggered Nudges (Not Recommended)

**Note**: Polling is not recommended because:
- Nudges are only triggered when users are connected via SSE
- If you're not connected via SSE, nudges won't be triggered
- You'll miss real-time delivery

If you must use polling (e.g., SSE not supported):

```javascript
// Poll for triggered nudges
async function fetchTriggeredNudges(accessToken) {
  const response = await fetch('/api/NudgeEngine/getUserNudges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken,
      status: 'triggered',
      limit: 50
    })
  });
  
  const result = await response.json();
  
  if (result.nudges) {
    // Filter to only nudges with messages (successfully triggered)
    const nudgesWithMessages = result.nudges.filter(n => n.triggeredAt !== null && n.message);
    
    // Display nudges to user
    nudgesWithMessages.forEach(nudge => {
      showNudgeNotification({
        nudgeId: nudge._id,
        taskId: nudge.task,
        message: nudge.message,
        deliveryTime: nudge.deliveryTime,
      });
    });
  }
}

// Poll every 5-10 seconds to catch nudges quickly
// Note: This will NOT trigger nudges, only fetch already-triggered ones
setInterval(() => {
  fetchTriggeredNudges(accessToken);
}, 5000);
```

### Option 3: Hybrid Approach

Use SSE for real-time delivery, with polling as a fallback:

```javascript
let eventSource = null;
let pollingInterval = null;

function startNudgeNotifications(accessToken) {
  // Try SSE first
  try {
    eventSource = new EventSource(`/api/nudges/stream?accessToken=${accessToken}`);
    
    eventSource.addEventListener('message', handleNudge);
    eventSource.onerror = () => {
      // SSE failed, fall back to polling
      eventSource.close();
      startPolling(accessToken);
    };
  } catch (error) {
    // SSE not supported, use polling
    startPolling(accessToken);
  }
}

function startPolling(accessToken) {
  pollingInterval = setInterval(() => {
    fetchTriggeredNudges(accessToken);
  }, 60000);
}

function handleNudge(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'nudge') {
    showNudgeNotification(data.nudge);
  }
}
```

## API Changes

### Updated Response: `getUserNudges`
Nudges now include the `message` field and `triggeredAt` timestamp when triggered:
```json
{
  "nudges": [
    {
      "_id": "nudge_id",
      "user": "user_id",
      "task": "task_id",
      "deliveryTime": "2025-01-15T10:00:00Z",
      "triggeredAt": "2025-01-15T10:05:23Z",
      "message": "Take a moment to dive into the first part of your task. It doesn't have to be perfect."
    }
  ]
}
```

**Status Filtering**:
- `status: "pending"` - Returns nudges where `triggeredAt` is `null`
- `status: "triggered"` - Returns nudges where `triggeredAt` is not `null`

### Updated Response: `getNudge`
Same structure - includes `triggeredAt` and `message` when triggered.

### Updated Response: `getReadyNudges`
Still returns untriggered nudges (`triggeredAt: null`, no `message` field yet).

## Migration Checklist

- [ ] Update nudge data types to include `message?: string` and `triggeredAt: Date | null` (replacing `triggered: boolean`)
- [ ] Update any code that checks `nudge.triggered` to check `nudge.triggeredAt !== null` instead
- [ ] **Implement SSE connection** - This is required for nudges to be triggered
- [ ] Update UI to display nudge messages
- [ ] Handle connection lifecycle (connect on login, disconnect on logout)
- [ ] Remove old polling logic for ready nudges (SSE is now the only way to trigger nudges)
- [ ] Remove any frontend calls to `scheduleNudge` endpoint (now backend-only)
- [ ] Remove any frontend calls to `nudgeUser` endpoint (now backend-only, triggered via SSE)
- [ ] Test connection/disconnection scenarios
- [ ] Test logout behavior (SSE should close automatically)

## Notes

1. **SSE Connection Required**: Nudges are only triggered when users are connected via SSE. If you're not connected, nudges won't be processed. Make sure to establish an SSE connection when users log in.

2. **Real-Time Processing**: When you connect via SSE, the system immediately:
   - Processes all ready nudges since your last connection (backlog)
   - Polls every 5 seconds for new ready nudges and triggers them
   - Sends nudges to you in real-time as they're generated

3. **Connection Lifecycle**: 
   - Connect to SSE when user logs in
   - SSE connection automatically closes when user logs out (authentication check)
   - Reconnect on login to resume nudge processing

4. **Message Storage**: All triggered nudges have their messages and `triggeredAt` timestamps stored in the database, so you can retrieve them later via API calls.

5. **No Breaking Changes**: Existing API endpoints still work, they just now return additional data (`message` field and `triggeredAt` timestamp instead of `triggered` boolean).

6. **Backend-Only Endpoints**: 
   - `scheduleNudge` is **backend-only** - nudges are automatically scheduled when tasks are created via the `AutoScheduleNudgeOnTaskCreate` sync
   - `nudgeUser` is **backend-only** - called automatically by SSE connections when ready nudges are detected
   - The frontend should not call these endpoints directly

7. **Nudge Lifecycle**:
   - Nudges are automatically scheduled when tasks are created
   - Nudges are automatically canceled when tasks are started (user doesn't need encouragement anymore)
   - Nudges are automatically canceled when tasks are deleted (cleanup)
   - Nudges are **NOT** canceled when tasks are completed (they've already served their purpose of encouraging starting)

8. **Efficiency**: This approach is more efficient because:
   - Nudges are only generated when users are connected (saves LLM API calls)
   - No background processing for disconnected users
   - Resources are only used for active connections

9. **Authentication**: The SSE endpoint automatically verifies authentication every polling cycle. If a user logs out, the connection is closed immediately and polling stops.

