// src/app/(app)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';

// Componentes do Material-UI
import { 
  AppBar, Toolbar, IconButton, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Box, CssBaseline, Divider, CircularProgress, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Ícones do Material-UI
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People'; 

const drawerWidth = 250; 

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth(); 

  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg')); // Use 'lg' para desktops maiores

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Lógica de redirecionamento para não autenticados
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') { // Adicionado check para não redirecionar se já estamos no login
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Exibe spinner enquanto autenticação está carregando
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando autenticação...</Typography>
      </Box>
    );
  }

  // Se não está autenticado e não está na página de login, o useEffect vai redirecionar.
  // Não renderizamos o layout completo para evitar erros.
  if (!user) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Redirecionando para o login...</Typography>
        </Box>
    );
  }

  // Definição dos itens do menu
  const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Meu Perfil', icon: <PersonIcon />, path: '/meu-perfil' },
    { text: 'Calendário da Igreja', icon: <PersonIcon />, path: '/agenda' },
    { text: 'Conectar', icon: <PeopleIcon />, path: '/conectar' }, 
    { text: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda' }, 
    { text: 'Pedidos de Oração', icon: <ForumIcon />, path: '/oracao' },
    { text: 'Dízimos e Ofertas', icon: <PriceCheckIcon />, path: '/doacao' }, 
  ];

  // Conteúdo do Drawer (Sidebar)
  const drawerContent = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={handleDrawerToggle} // Fecha o drawer ao clicar em um item (em mobile)
      onKeyDown={handleDrawerToggle}
    >
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          AD Plenitude
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding 
            component="li" // Necessário para o Material-UI (o erro anterior)
          >
            <ListItemButton 
              onClick={() => router.push(item.path)}
              selected={pathname === item.path} // Move selected para o botão
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding component="li"> 
          <ListItemButton onClick={handleLogout}> 
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
          width: { lg: `calc(100% - ${drawerWidth}px)` }, // Ajusta para desktops maiores
          ml: { lg: `${drawerWidth}px` }, // Margem esquerda para desktops maiores
        }}
      >
        <Toolbar>
          {/* ✅ Ícone do menu hambúrguer para mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }} // Oculta o ícone em telas LG+ (desktop)
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            AD Plenitude
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Drawer para telas menores (mobile/tablet) */}
      <Drawer
        variant="temporary" // Temporário (aparece/desaparece)
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhor para mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' }, // Mostra em XS (mobile) até MD, esconde em LG+
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer para telas maiores (desktop) */}
      <Drawer
        variant="permanent" // Permanente (sempre visível)
        sx={{
          display: { xs: 'none', lg: 'block' }, // Esconde em XS até MD, mostra em LG+
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open // Sempre aberto para variant="permanent"
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo principal da página */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          marginTop: '64px', // Espaço para a AppBar
          width: { lg: `calc(100% - ${drawerWidth}px)` }, // Ajusta largura para telas maiores
          ml: { lg: `${drawerWidth}px` }, // Margem esquerda para telas maiores
        }}
      >
        {children}
      </Box>
    </Box>
  );
}