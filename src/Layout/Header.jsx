import { AppBar, Toolbar, Typography } from '@mui/material';
import React from 'react'

const Header = ({ title }) => {
  return ( 
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header