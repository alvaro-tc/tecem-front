
import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    Container,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    Typography
} from '@material-ui/core';
import { IconMenu2, IconX } from '@tabler/icons';

// project imports
import Logo from './../../../ui-component/Logo';

const NAV_LINKS = [
    { label: 'Inicio', to: '/' },
    { label: 'Cursos', to: '/courses' },
    { label: 'Acerca de', to: '/about' },
    { label: 'Publicaciones', to: '/publications' },
    { label: 'Proyectos', to: '/project-registration' },
];

const LandingHeader = () => {
    const theme = useTheme();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isActive = (to) => location.pathname === to;

    return (
        <>
            <AppBar
                position="relative"
                elevation={0}
                sx={{ backgroundColor: 'transparent', backdropFilter: 'blur(8px)', zIndex: 10 }}
            >
                <Container maxWidth="lg" sx={{ backgroundColor: 'transparent' }}>
                    <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                        {/* Logo */}
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}
                        >
                            <Logo />
                        </Box>

                        {/* Desktop Nav */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                            {NAV_LINKS.map((link) => (
                                <Button
                                    key={link.to}
                                    component={RouterLink}
                                    to={link.to}
                                    color="inherit"
                                    sx={{
                                        color: theme.palette.text.primary,
                                        fontWeight: isActive(link.to) ? 700 : 400,
                                        borderBottom: isActive(link.to)
                                            ? `2px solid ${theme.palette.secondary.main}`
                                            : '2px solid transparent',
                                        borderRadius: 0,
                                        px: 1.5
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="contained"
                                color="secondary"
                                sx={{ borderRadius: '50px', px: 3, ml: 1 }}
                            >
                                Ingresar
                            </Button>
                        </Box>

                        {/* Mobile Hamburger */}
                        <IconButton
                            sx={{ display: { xs: 'flex', md: 'none' }, color: theme.palette.text.primary }}
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <IconMenu2 size="1.8rem" />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: 280,
                        pt: 2,
                        background: theme.palette.background.paper
                    }
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box component={RouterLink} to="/" onClick={() => setDrawerOpen(false)} sx={{ textDecoration: 'none' }}>
                        <Logo />
                    </Box>
                    <IconButton onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú">
                        <IconX size="1.5rem" />
                    </IconButton>
                </Box>
                <Divider />

                {/* Nav Links */}
                <List sx={{ pt: 2 }}>
                    {NAV_LINKS.map((link) => (
                        <ListItem
                            button
                            key={link.to}
                            component={RouterLink}
                            to={link.to}
                            onClick={() => setDrawerOpen(false)}
                            sx={{
                                py: 1.5,
                                px: 3,
                                borderLeft: isActive(link.to)
                                    ? `4px solid ${theme.palette.secondary.main}`
                                    : '4px solid transparent',
                                bgcolor: isActive(link.to)
                                    ? theme.palette.secondary.light + '30'
                                    : 'transparent'
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: isActive(link.to) ? 700 : 500,
                                            color: isActive(link.to)
                                                ? theme.palette.secondary.main
                                                : theme.palette.text.primary
                                        }}
                                    >
                                        {link.label}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ mx: 3, my: 2 }} />

                {/* Login Button */}
                <Box sx={{ px: 3 }}>
                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="large"
                        onClick={() => setDrawerOpen(false)}
                        sx={{ borderRadius: '50px', py: 1.5, fontWeight: 600 }}
                    >
                        Ingresar al Sistema
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};

export default LandingHeader;
