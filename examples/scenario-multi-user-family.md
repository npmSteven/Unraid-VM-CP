# Scenario: Multi-User Family Server

**Use case:** A home server running multiple VMs for different family members — a gaming VM for one person, a development environment for another, a media server that everyone uses but only one person manages.

## Setup

### Step 1: Create users for each family member

| User | Purpose |
|------|---------|
| `alice` | Owns the gaming VM, full control |
| `bob` | Owns the dev VM, full control |
| `charlie` | View-only access to the media server to check status |

### Step 2: Link VMs and set permissions

| User | VM | Permissions |
|------|----|-------------|
| `alice` | `Gaming PC (Windows)` | Start, Stop, Restart, Pause, Resume |
| `alice` | `Media Server (Plex)` | View only (all unchecked) |
| `bob` | `Dev Environment (Ubuntu)` | All except Remove VM and Disks |
| `bob` | `Media Server (Plex)` | View only (all unchecked) |
| `charlie` | `Media Server (Plex)` | View only (all unchecked) |

### Step 3: Each person logs in with their own credentials

- **Alice** sees two VM cards: `Gaming PC` (full control) and `Media Server` (status only). She can start her gaming VM after a server reboot without bothering anyone.
- **Bob** sees two VM cards: `Dev Environment` (full control, no destructive remove) and `Media Server` (status only).
- **Charlie** sees one VM card: `Media Server` (status only). He can check if Plex is running but can't touch anything.

## Benefits

| Benefit | How |
|---------|-----|
| **No shared credentials** | Each person has their own login, no Unraid root password shared |
| **No accidental interference** | Alice can't stop Bob's dev VM, Bob can't reboot Alice's gaming VM |
| **Self-service** | Family members can start/stop their own VMs without asking you |
| **Audit trail** | You know who started or stopped a VM based on the user account |
| **Easy cleanup** | If someone no longer needs access, delete their user account — all VM links and permissions are removed automatically |

## Extending

- **Kids who play games**: Give Start/Stop/Restart only — no remove or hibernate.
- **Guest access**: Create a `guest` user linked to a guest VM only (if you run one).
- **Maintenance mode**: Temporarily disable all actions for a user while you perform server maintenance.
