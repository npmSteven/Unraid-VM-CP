# Scenario: Power User with Full Control

**Use case:** A trusted colleague or team member needs full control over specific VMs — start, stop, restart, force stop, hibernate, and remove — but only on VMs you designate.

## Setup

1. **Create the user:**
   - **Users → Create User**
   - Username: `devops`
   - Password: `strong-unique-password`

2. **Link each VM and set full permissions:**
   - **Users → devops → VMs → Link a VM**
   - Select each VM they should manage
   - For each linked VM, open the dropdown → **Permissions**
   - Enable all actions:
     - Start ✓
     - Stop ✓
     - Restart ✓
     - Force Stop ✓
     - Pause ✓
     - Resume ✓
     - Hibernate ✓
     - Remove VM ✓
     - Remove VM and Disks ✓ *(use with caution)*
   - Click **Update**

3. **Repeat** for each VM they should manage.

## Result

`devops` can fully manage the assigned VMs: power-cycle test environments, hibernate idle dev VMs, pause long-running builds. They cannot see or touch any VMs you haven't explicitly linked.

## Security Considerations

| Risk | Mitigation |
|------|------------|
| User can delete a VM and its disks | Disable `canRemoveVMAndDisks` if you want them to only stop/start |
| Password shared or leaked | Change the password from **Users → edit** |
| User should not access production VMs | Simply don't link production VMs to this user |

## Alternative: Per-VM Permission Profiles

You can mix power-user access on some VMs with read-only on others:

| VM | Permissions |
|----|------------|
| `Dev Server` | All enabled (full control) |
| `CI Runner` | Start, Stop, Restart only (no remove) |
| `Staging DB` | Start, Stop, Pause, Resume (no force stop, no remove) |
| `Monitoring` | All disabled (read-only) |

Each VM's permissions are set independently — the same user can have different access levels across VMs.
