import React, {useState, useEffect} from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import {auth, db} from '../firebase';
import { CircularProgress, Table, TableHead, TableRow, TableBody, TableCell,  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const UsersAndPermissions = () => {
  const [users, setUsers] = useState([]);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    console.log(snapshot.docs);
    setUsers(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  });

  return () => unsubscribe();
}, []);

  const [loading, setLoading] = useState(false);

const [fullName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handleOpenAddUserDialog = () => {
    setAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSaveUser = async () => {
  try {
      setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    ).then((res)=> {
console.log(res);
addDoc(collection(db, 'users'), {
      fullName,
      email,
    });
    })

// console.log(userCredential);

    // await addDoc(collection(db, 'users'), {
    //   fullName,
    //   email: userCredential.email,
    // });

    handleCloseAddUserDialog();
    setUsers((prevUsers) => [...prevUsers, { fullName, email }]); // Update table
  } catch (error) {
    console.error(error);
    // Handle error messages
  }
  setLoading(false);
};


  return (
    <div>
      <Button type="submit"
                  // fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  style={{ marginTop: "16px" }} onClick={() => handleOpenAddUserDialog()}>{loading ? <CircularProgress size={24} /> : "Add User"}</Button>

<Dialog open={addUserDialogOpen} onClose={handleCloseAddUserDialog}>
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={fullName}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          fullWidth
        />
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAddUserDialog}>Cancel</Button>
        <Button onClick={handleSaveUser}>{loading ? <CircularProgress size={24} /> : "Save"}</Button>
      </DialogActions>
    </Dialog>
      <div>
      <Table>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.fullName}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
</div>
    </div>
  )
}

export default UsersAndPermissions