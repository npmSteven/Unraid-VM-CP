# Scenario: Read-Only VM Access

**Use case:** A friend or colleague needs to check if a VM is running, but should not be able to start, stop, or modify it.

## Setup

1. **Create a user** in the Unraid VM CP admin panel:
   - Go to **Users → Create User**
   - Username: `friend`
   - Password: `something-secure`

2. **Link the VM** to the user:
   - Go to **Users → friend → VMs**
   - Click **Link a VM**
   - Select the VM (e.g., `Web Server`)
   - A link is created with default permissions (Start, Stop, Restart enabled)

3. **Restrict to read-only**:
   - On the linked VM card, open the dropdown → **Permissions**
   - Uncheck **every action** (Start, Stop, Restart, Force Stop, Pause, Resume, Hibernate, Remove VM, Remove VM and Disks)
   - Click **Update**

## Result

When `friend` logs in, they will see the VM card with its status (running/stopped/paused), OS, RAM, storage, and IP address — but every dropdown action will be disabled. The user can **view** but cannot **change** anything.

## Why This Is Useful

| Situation | Benefit |
|-----------|---------|
| Developer checking if a staging server is up | See status without accidentally shutting it down |
| Non-technical stakeholder monitoring a service | Minimal training needed — just look at the color |
| Temporary access for an audit | Grant view-only and revoke later without risk |
