import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminUsersPage from '../AdminUsersPage.jsx';
import adminApi from '../api.js';

vi.mock('../auth/AuthProvider.jsx', () => {
  const updateUser = vi.fn();
  return {
    useAuth: () => ({
      user: { id: 'admin-1' },
      updateUser,
    }),
  };
});

vi.mock('../api.js', () => ({
  default: {
    fetchUsers: vi.fn(),
    fetchRoleCatalog: vi.fn(),
    updateUser: vi.fn(),
    setUserRoles: vi.fn(),
  },
}));

describe('AdminUsersPage confirmations', () => {
  const sampleUser = {
    id: 'user-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'ACTIVE',
    roles: ['MEMBER'],
    isEmailVerified: true,
  };

  const sampleRoles = [
    { name: 'MEMBER', label: 'Member' },
    { name: 'ADMIN', label: 'Admin' },
  ];

  beforeEach(() => {
    adminApi.fetchUsers.mockResolvedValue({ data: { items: [sampleUser] } });
    adminApi.fetchRoleCatalog.mockResolvedValue({ roles: sampleRoles });
    adminApi.updateUser.mockResolvedValue({ user: { ...sampleUser, status: 'INACTIVE' } });
    adminApi.setUserRoles.mockResolvedValue({ user: { ...sampleUser, roles: ['MEMBER', 'ADMIN'] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a confirmation before changing status and defers the API call until confirmed', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    const statusButton = await screen.findByRole('button', { name: /active/i });
    await user.click(statusButton);

    const inactiveOption = await screen.findByRole('menuitem', { name: 'INACTIVE' });
    await user.click(inactiveOption);

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent("Change John Doe's status from ACTIVE to INACTIVE?");
    expect(adminApi.updateUser).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: /change status/i }));

    await waitFor(() => {
      expect(adminApi.updateUser).toHaveBeenCalledWith('user-1', { status: 'INACTIVE' });
    });
  });

  it('confirms role updates before calling the API', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    const manageButton = await screen.findByRole('button', { name: /manage/i });
    await user.click(manageButton);

    const adminRoleOption = await screen.findByRole('menuitemcheckbox', { name: 'Admin' });
    await user.click(adminRoleOption);

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Grant the Admin role to John Doe?');
    expect(adminApi.setUserRoles).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: /apply change/i }));

    await waitFor(() => {
      expect(adminApi.setUserRoles).toHaveBeenCalledWith('user-1', ['MEMBER', 'ADMIN']);
    });
  });
});
