import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
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
                onCheckedChange={(value) => onRoleToggle(user.id, role.name, !!value)}
                className="capitalize"
              >
                {role.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
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
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
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
                  onStatusChange(user.id, option);
                }}
                className="uppercase"
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
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
