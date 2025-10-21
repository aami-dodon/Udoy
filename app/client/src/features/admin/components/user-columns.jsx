import { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Checkbox,
} from '@components/ui';
import { LucideIcon } from '@icons';

export const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'LOCKED', 'INVITED'];

const formatUserName = (user) => {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return user.email;
};

const RolesCell = ({ user, availableRoles, onRoleToggle }) => {
  const activeRoles = user.roles || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const confirmedRef = useRef(false);

  const handleRoleToggleRequest = (role, enable) => {
    setPendingChange({ roleName: role.name, roleLabel: role.label, enable });
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingChange) {
      confirmedRef.current = true;
      onRoleToggle(user.id, pendingChange.roleName, pendingChange.enable, { confirmed: true });
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    if (pendingChange) {
      onRoleToggle(user.id, pendingChange.roleName, pendingChange.enable, { confirmed: false });
    }
    setPendingChange(null);
    setDialogOpen(false);
    confirmedRef.current = false;
  };

  const handleDialogOpenChange = (isOpen) => {
    if (!isOpen) {
      if (!confirmedRef.current && pendingChange) {
        onRoleToggle(user.id, pendingChange.roleName, pendingChange.enable, { confirmed: false });
      }
      setDialogOpen(false);
      setPendingChange(null);
      confirmedRef.current = false;
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeRoles.length ? (
        activeRoles.map((role) => (
          <Badge key={role} variant="secondary" className="text-[10px] uppercase tracking-wide">
            {role}
          </Badge>
        ))
      ) : (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
          None
        </Badge>
      )}
      {availableRoles.length ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                Manage
                <LucideIcon name="ChevronDown" className="ml-1 h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Toggle roles
              </DropdownMenuLabel>
              {availableRoles.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role.name}
                  checked={activeRoles.includes(role.name)}
                  onCheckedChange={(value) => handleRoleToggleRequest(role, !!value)}
                  className="capitalize"
                >
                  {role.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm role update</AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingChange
                    ? `${pendingChange.enable ? 'Grant' : 'Remove'} the ${pendingChange.roleLabel} role ${
                        pendingChange.enable ? 'to' : 'from'
                      } ${formatUserName(user)}?`
                    : ''}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>Apply change</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </div>
  );
};

const StatusCell = ({ user, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const confirmedRef = useRef(false);

  const handleRequest = (nextStatus) => {
    if (nextStatus === user.status) {
      setMenuOpen(false);
      return;
    }
    setPendingStatus(nextStatus);
    setDialogOpen(true);
    setMenuOpen(false);
  };

  const handleConfirm = () => {
    if (pendingStatus) {
      confirmedRef.current = true;
      onStatusChange(user.id, pendingStatus, { confirmed: true });
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    if (pendingStatus) {
      onStatusChange(user.id, pendingStatus, { confirmed: false });
    }
    setPendingStatus(null);
    setDialogOpen(false);
    confirmedRef.current = false;
  };

  const handleDialogOpenChange = (isOpen) => {
    if (!isOpen) {
      if (!confirmedRef.current && pendingStatus) {
        onStatusChange(user.id, pendingStatus, { confirmed: false });
      }
      setDialogOpen(false);
      setPendingStatus(null);
      confirmedRef.current = false;
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 justify-between px-3 text-xs font-medium uppercase">
            {user.status}
            <LucideIcon name="ChevronDown" className="ml-2 h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={(event) => {
                event.preventDefault();
                handleRequest(option);
              }}
              className="uppercase"
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus
                ? `Change ${formatUserName(user)}'s status from ${user.status} to ${pendingStatus}?`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Change status</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const createUserColumns = ({ availableRoles, onStatusChange, onRoleToggle }) => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.email}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{formatUserName(user)}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 px-3 text-xs font-semibold uppercase tracking-wide"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <LucideIcon name="ArrowUpDown" className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm text-foreground">{row.getValue('email')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusCell user={row.original} onStatusChange={onStatusChange} />,
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => (
      <RolesCell user={row.original} availableRoles={availableRoles} onRoleToggle={onRoleToggle} />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Email verified',
    cell: ({ row }) => {
      const verified = row.getValue('isEmailVerified');

      return verified ? (
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          Verified
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Pending
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <LucideIcon name="MoreHorizontal" className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                navigator.clipboard.writeText(user.id);
              }}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                navigator.clipboard.writeText(user.email);
              }}
            >
              Copy email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
];
