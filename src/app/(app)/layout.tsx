// src/app/(app)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
  const { userProfile, loading } = useAuth(); // Usando userProfile do AuthContext

  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

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
    if (!loading && !userProfile && pathname !== '/login') {
      console.log("Layout - Redirecionando para login: Não logado e carregamento completo.");
      router.push('/login');
    }
  }, [userProfile, loading, router, pathname]);

  // =============== START: LOGS DE DEPURAÇÃO PARA VISIBILIDADE DO MENU FINANÇAS ===============
  useEffect(() => {
    console.log("DEBUG - Layout useEffect - Loading:", loading);
    console.log("DEBUG - Layout useEffect - UserProfile:", userProfile);
    if (userProfile) {
      console.log("DEBUG - Layout useEffect - UserProfile.role:", userProfile.role);
      if (['dirigente', 'pastor_presidente'].includes(userProfile.role as string)) {
        console.log("DEBUG - Layout useEffect - Role é válida para Finanças!");
      } else {
        console.log("DEBUG - Layout useEffect - Role NÃO é válida para Finanças. Role atual:", userProfile.role);
      }
    } else if (!loading) {
      console.log("DEBUG - Layout useEffect - UserProfile é nulo/undefined após carregamento.");
    }
  }, [userProfile, loading]); // Dependências relevantes para o estado de autenticação
  // =============== END: LOGS DE DEPURAÇÃO PARA VISIBILIDADE DO MENU FINANÇAS ===============


  // Exibe spinner enquanto autenticação está carregando
  if (loading) {
    console.log("Layout - Exibindo spinner de carregamento.");
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando autenticação...</Typography>
      </Box>
    );
  }

  // Se não está autenticado e não está na página de login, o useEffect vai redirecionar.
  if (!userProfile) {
    console.log("Layout - Exibindo spinner de redirecionamento para login (userProfile ausente).");
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Redirecionando para o login...</Typography>
        </Box>
    );
  }

  // Definição dos itens do menu padrão
  const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Meu Perfil', icon: <PersonIcon />, path: '/meu-perfil' },
    { text: 'Conectar', icon: <PeopleIcon />, path: '/conectar' },
    { text: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda' },
    { text: 'Pedidos de Oração', icon: <ForumIcon />, path: '/oracao' },
    { text: 'Dízimos e Ofertas', icon: <PriceCheckIcon />, path: '/doacao' },
  ];

  // =============== START: LÓGICA CONDICIONAL E LOGS PARA O ITEM "FINANÇAS" ===============
  console.log("DEBUG - Lógica do menu Finanças - UserProfile na construção do menu:", userProfile);
  if (userProfile && userProfile.role) { // Verifica se userProfile e role existem
      console.log(`DEBUG - Lógica do menu Finanças - Verificando role: '${userProfile.role}'`);
      if (['dirigente', 'pastor_presidente'].includes(userProfile.role)) {
          console.log("DEBUG - Lógica do menu Finanças - --> SIM, role corresponde. Adicionando menu Finanças.");
          menuItems.push({ text: 'Finanças', icon: <AttachMoneyIcon />, path: '/financas' });
      } else {
          console.log(`DEBUG - Lógica do menu Finanças - --> NÃO, role '${userProfile.role}' não corresponde aos requisitos.`);
      }
  } else {
      console.log("DEBUG - Lógica do menu Finanças - UserProfile ou userProfile.role está faltando. Não é possível adicionar Finanças.");
  }
  // =============== END: LÓGICA CONDICIONAL E LOGS PARA O ITEM "FINANÇAS" ===============


  // Conteúdo do Drawer (Sidebar)
  const drawerContent = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={handleDrawerToggle}
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
            component="li"
          >
            <ListItemButton
              onClick={() => router.push(item.path)}
              selected={pathname === item.path}
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
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
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
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer para telas maiores (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo principal da página */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}