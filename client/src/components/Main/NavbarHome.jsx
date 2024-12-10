import React, { useState } from "react";
import { Box, Link, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { FaWaze } from "react-icons/fa";
import { BsWhatsapp, BsTelephoneOutbound, BsPersonCircle} from "react-icons/bs";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../../assets/imgs/הלוגו.png";
import { Link as RouterLink } from 'react-router-dom';
const NavbarHome = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box dir={"rtl"}
    sx={{
      marginTop: 0 ,
      backgroundColor: "black",   
      position: "absolute",
      top: 0,
      left: 0,

      width: "100%",
      zIndex: 1000,
      height: "90px",
      display: "flex",
      alignItems: "center",
      justifyContent:  "space-evenly",
   
    }}
    >
   <Box display="flex" alignItems="center" marginTop={"auto"}>   
        <Link component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          <Box 
            component="img" 
            src={logo} 
            alt="אולם האירועים הפנינה"
            sx={{
              width: { xs: '140px', sm: '200px', md: '200px' }, 
              height: { xs: '100px', sm: '200px', md: '150px' },
              position: 'relative',
              maxHeight: '150px', 
              borderRadius: '8px', 
              marginTop: 'auto',
              cursor: 'pointer',
              objectFit: 'cover',
              boxShadow: '0 5px 20px rgba(0, 0, 0, 3)',
            }} 
          />
        </Link> 
      </Box>


     {/* קישורים במרכז */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: "1rem" }}>
        {[  { label: "דף הבית", to: "/" },   { label: "קצת עלינו", to: "/about" }, { label: "צור קשר", to: "/contact" },
           { label: "גלריה", to: "/Gallery" }, { label: "הזמנות אונליין", to: "/ordersOnline" },
        ].map((link, index) => (
          <Link key={index}  href={link.to} underline="none"
            sx={{
              color: "#FFF",
              fontSize: "1rem",
              transition: "color 0.3s",
              "&:hover": { color: "#FFD700" },
            }}
          > {link.label}  
          </Link>
        ))}
      </Box>

      {/* אייקונים בצד שמאל */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              href="https://ul.waze.com/ul?preview_venue_id=23003453.230165602.328234&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
              target="_blank" sx={{color: "#FFF",transition: "color 0.3s", "&:hover": {color: "#FFD700" }}} 
            > <FaWaze /> 
            </IconButton>
            <IconButton href="tel:+972548520195" sx={{color: "#FFF",transition: "color 0.3s", "&:hover": {color: "#FFD700" }}}>
              <BsTelephoneOutbound />
            </IconButton>
            <IconButton href="https://wa.me/+972546600200" target="_blank" sx={{color: "#FFF",transition: "color 0.3s",  "&:hover": {color: "#FFD700" }}}>
              <BsWhatsapp />
            </IconButton>
            <IconButton href="/personal-area" sx={{color: "#FFF",transition: "color 0.3s", "&:hover": {color: "#FFD700" }}}>
              <BsPersonCircle />
            </IconButton>
      </Box>



      {/* תפריט רספונסיבי */}
      <Box sx={{ display: { xs: "block", md: "none" }, backgroundColor: "#000", color: "#FFF"}}>
        <IconButton sx={{ color: "#FFF" }} onClick={toggleDrawer(true)}
        > <MenuIcon /> 
        </IconButton>

        <Drawer  anchor="left" 
        sx={{'& .MuiDrawer-paper': {
          backgroundColor: "#000", 
          width: '250px', 
          color: "#FFF", 
          padding: '1rem 0',
          maxHeight: '100vh', 
       }}} 
        open={drawerOpen} onClose={toggleDrawer(false)}  >
          <Box >
            <List>
              {[  { label: "דף הבית", to: "/" },  { label: "קצת עלינו", to: "/about" }, { label: "צור קשר", to: "/contact" },
              { label: "גלריה", to: "/Gallery" },   { label: "הזמנות אונליין", to: "/ordersOnline" },
              ].map((link, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton href={link.to}>
                    <ListItemText primary={link.label}                
                      sx={{
                        textAlign: "center",
                        color: "#FFF",
                        transition: "color 0.3s",
                        "&:hover": { color: "#FFD700" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>


     
    </Box>
  );
};

export default NavbarHome;