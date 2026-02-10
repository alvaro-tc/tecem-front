
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Box, Button, Container, Stack } from '@material-ui/core';

// project imports
import Logo from './../../../ui-component/Logo';

const LandingHeader = () => {
    const theme = useTheme();
    // Header with transparency and blur effect

    return (
        <AppBar position="relative" elevation={0} sx={{ backgroundColor: 'transparent', backdropFilter: 'blur(8px)', zIndex: 1201 }}>
            <Container maxWidth="lg" sx={{ backgroundColor: 'transparent' }}>
                <Toolbar disableGutters>
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}>
                        <Logo />
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Button component={RouterLink} to="/" color="inherit" sx={{ color: theme.palette.text.primary }}>
                            Inicio
                        </Button>
                        <Button component={RouterLink} to="/courses" color="inherit" sx={{ color: theme.palette.text.primary }}>
                            Cursos
                        </Button>
                        <Button component={RouterLink} to="/about" color="inherit" sx={{ color: theme.palette.text.primary }}>
                            Acerca de
                        </Button>
                        <Button component={RouterLink} to="/publications" color="inherit" sx={{ color: theme.palette.text.primary }}>
                            Publicaciones
                        </Button>
                        <Button component={RouterLink} to="/project-registration" color="inherit" sx={{ color: theme.palette.text.primary }}>
                            Proyectos
                        </Button>
                        <Button component={RouterLink} to="/login" variant="contained" color="secondary" sx={{ borderRadius: '50px', px: 3 }}>
                            Ingresar
                        </Button>
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default LandingHeader;
