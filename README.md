# tcpsim
tcpsim is a web-based TCP state machine simulator that allows you to visualize and understand TCP connection states and transitions.

<img width="640" alt="tcpsim" src="https://github.com/user-attachments/assets/389de57b-e9f2-4659-8545-d9199f09836a" />

## Features

- Simulates two hosts with fixed IP addresses (1.1.1.1 and 1.1.1.2)
- Supports all TCP packet types (SYN, ACK, SYN_ACK, FIN, FIN_ACK, RST)
- Shows real-time state transitions for both sender and receiver
- Maintains connection history with timestamps
- Visualizes packet flow with directional arrows (➡️ for sent, ⬅️ for received)
- Quick endpoint reversal for simulating responses

## Usage

1. Open `index.html` in a web browser

2. The interface has two main sections:
   - Left panel: Packet sending controls
   - Right panel: Real-time state display for both hosts

3. To send a packet:
   - Select source host (1.1.1.1 or 1.1.1.2)
   - Enter source port (e.g., 12345)
   - Select destination host
   - Enter destination port (e.g., 80)
   - Choose packet type (SYN, ACK, etc.)
   - Click "Send Packet"

4. To simulate a three-way handshake:
   ```
   a. Send SYN from 1.1.1.1:12345 to 1.1.1.2:80
   b. Click reverse button
   c. Change packet type to SYN_ACK and send
   d. Click reverse button
   e. Change packet type to ACK and send
   ```

5. The state panel shows:
   - Current state of each port
   - Remote endpoint information
   - Complete history of state transitions
   - Packet flow visualization

## State Transitions

The simulator supports all standard TCP states:
- CLOSED
- LISTEN
- SYN_SENT
- SYN_RECEIVED
- ESTABLISHED
- FIN_WAIT_1
- FIN_WAIT_2
- CLOSE_WAIT
- CLOSING
- LAST_ACK
- TIME_WAIT

## Implementation Details

- `tcp-state.js`: Core TCP state machine implementation
  - Handles state transitions
  - Manages connection tracking
  - Processes packet events
  - Maintains history
  - Supports both active and passive opens

- `index.html`: User interface
  - Interactive packet sender
  - Real-time state visualization
  - Connection history display
  - Quick endpoint reversal
  - Modern, responsive design


