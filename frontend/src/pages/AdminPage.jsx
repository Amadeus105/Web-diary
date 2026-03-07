import { useEffect, useState } from "react";
import { getAdminUsers, deleteAdminUser, getAdminItems, deleteAdminItem } from "../services/api";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const fetchAll = async () => {
    const u = await getAdminUsers();
    const i = await getAdminItems();
    setUsers(u);
    setItems(i);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Admin Panel</h2>

      <h4>All Users</h4>
      <ul className="list-group mb-4">
        {users.map((u) => (
          <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{u.username} {u.is_admin && <span className="badge bg-danger">admin</span>}</span>
            <button className="btn btn-danger btn-sm" onClick={async () => {
              await deleteAdminUser(u.id);
              fetchAll();
            }}>Delete</button>
          </li>
        ))}
      </ul>

      <h4>All Items</h4>
      <ul className="list-group">
        {items.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span><b>{item.name}</b> ({item.type}) — user_id: {item.user_id}</span>
            <button className="btn btn-danger btn-sm" onClick={async () => {
              await deleteAdminItem(item.id);
              fetchAll();
            }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;