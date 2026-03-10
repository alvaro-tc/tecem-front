import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack
} from '@material-ui/core';
import LandingHeader from './LandingHeader';

const AboutPage = () => {
    const theme = useTheme();

    const objectives = [
        {
            icon: '💡',
            title: 'Educación Innovadora',
            description: 'Ofrecer cursos actualizados sobre tecnologías emergentes sobre Desarrollo Web, Comercio electrónico, Seguridad informática, Inteligencia artificial y blockchain'
        },
        {
            icon: '🌐',
            title: 'Accesibilidad',
            description: 'Garantizar que estudiantes y profesionales de diversas áreas accedan a formación de calidad.'
        },
        {
            icon: '🤝',
            title: 'Comunidad Tecnológica',
            description: 'Fomentar una red de aprendizaje colaborativo a través de plataformas virtuales y grupos de discusión.'
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Hero and Content Section with Unified Background */}
            <Box
                sx={{
                    pt: 0,
                    pb: 8,
                    background: `linear-gradient(to bottom, ${theme.palette.secondary.light} 0%, ${theme.palette.background.default} 40%, ${theme.palette.grey[50]} 100%)`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <LandingHeader />
                <Box sx={{ pt: { xs: 6, md: 12 } }} />

                {/* Decorative shapes */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: theme.palette.primary.light, opacity: 0.2, zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: theme.palette.secondary.main, opacity: 0.15, zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, color: theme.palette.grey[900], mb: 2 }}>
                            Acerca de EMERGENTES
                        </Typography>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            Institución Académica
                        </Typography>
                        <Typography variant="h5" color="textSecondary" sx={{ fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
                            Conoce nuestra misión y visión para formar profesionales del futuro
                        </Typography>
                    </Box>
                </Container>

                {/* Mission Card */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 6 }}>
                    <Card
                        sx={{
                            background: theme.palette.primary.dark,
                            color: '#fff',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: theme.shadows[10],
                            mb: 8
                        }}
                    >
                        {/* Decorative corner */}
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 0 100%' }} />

                        <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
                            <Typography variant="h2" gutterBottom sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                                Nuestra Misión
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: 1.8, opacity: 0.95 }}>
                                EMERGENTES es una plataforma educativa innovadora, diseñada para ofrecer formación de vanguardia en tecnologías de información y comunicación emergentes. Nuestro objetivo es preparar a estudiantes, docentes y profesionales para liderar en un mundo tecnológico en constante evolución.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Objectives Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 700,
                                color: theme.palette.grey[900],
                                mb: 6
                            }}
                        >
                            Nuestros Objetivos
                        </Typography>

                        <Grid container spacing={4}>
                            {objectives.map((objective, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            borderRadius: 6,
                                            transition: 'all 0.4s ease',
                                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f4fc 100%)',
                                            border: `3px solid transparent`,
                                            boxShadow: '0 8px 24px rgba(142, 36, 170, 0.12)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-12px) scale(1.02)',
                                                boxShadow: '0 16px 48px rgba(142, 36, 170, 0.24)',
                                                border: `3px solid ${theme.palette.primary.main}`,
                                                background: 'linear-gradient(145deg, #ffffff 0%, #f3e5f5 100%)'
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '6px',
                                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease'
                                            },
                                            '&:hover::before': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            {/* Icon Container */}
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 3,
                                                    boxShadow: `0 8px 20px ${theme.palette.primary.light}60`,
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(5deg)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h1" sx={{ fontSize: '3.5rem' }}>
                                                    {objective.icon}
                                                </Typography>
                                            </Box>

                                            {/* Title */}
                                            <Typography
                                                variant="h4"
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 800,
                                                    mb: 2,
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text'
                                                }}
                                            >
                                                {objective.title}
                                            </Typography>

                                            {/* Description */}
                                            <Typography
                                                variant="body1"
                                                color="textSecondary"
                                                sx={{
                                                    lineHeight: 1.8,
                                                    fontSize: '1rem',
                                                    color: theme.palette.grey[700]
                                                }}
                                            >
                                                {objective.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>


            {/* Footer */}
            <Box sx={{ background: theme.palette.grey[900], color: '#fff', py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h3" sx={{ color: '#fff', mb: 2 }}>Plataforma EMERGENTES</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Facilitando la educación y administración académica.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={8} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="caption" sx={{ opacity: 0.5 }}>
                                © 2026 Plataforma Emergentes. Todos los derechos reservados.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default AboutPage;
