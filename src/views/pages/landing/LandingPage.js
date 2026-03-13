
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import { Button, Grid, Typography, Container, Box, Stack, Card, CardContent, CircularProgress } from '@material-ui/core';

// project imports
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import AnimateButton from './../../../ui-component/extended/AnimateButton';
import dashboardPreview from './../../../assets/images/landing_dashboard.png';
import axios from 'axios';
import configData from '../../../config';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import MainCard from '../../../ui-component/cards/MainCard';
import { getScheduleItems } from '../../../utils/scheduleUtils';

const LandingPage = () => {
    const theme = useTheme();
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [landingConfig, setLandingConfig] = React.useState(null);



    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${configData.API_SERVER}student-course-registration/open_courses/`);
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLandingConfig = async () => {
            try {
                const response = await axios.get(`${configData.API_SERVER}landing-page-config/`);
                setLandingConfig(response.data);
            } catch (error) {
                console.error("Failed to fetch landing config", error);
            }
        };

        fetchCourses();
        fetchLandingConfig();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseHost = configData.API_SERVER.replace(/\/api\/$/, '');
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseHost}${path}`;
    };

    const sliderSettings = {
        dots: true,
        infinite: courses.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2, slidesToScroll: 1, infinite: courses.length > 2 }
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1, slidesToScroll: 1, initialSlide: 0 }
            }
        ]
    };



    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    pt: 0,
                    pb: { xs: 6, md: 12 },
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.background.default} 100%)`,
                    borderRadius: '0 0 50% 50% / 4%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <LandingHeader />
                <Box sx={{ pt: { xs: 6, md: 12 } }} />
                {/* Abstract Background Shapes */}
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: theme.palette.primary.light, opacity: 0.3, zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: 50, left: -50, width: 200, height: 200, borderRadius: '50%', background: theme.palette.secondary.main, opacity: 0.1, zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '4rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                    color: theme.palette.grey[900],
                                    mb: 2
                                }}
                            >
                                Bienvenido a la <br />
                                <Box component="span" sx={{ color: theme.palette.primary.main }}>Plataforma EMERGENTES</Box>
                            </Typography>
                            <Typography variant="h5" color="textSecondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                Accede a nuestras funcionalidades desde el panel de administración
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
                            >
                                <AnimateButton>
                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        sx={{ borderRadius: '50px', px: 4, py: 1.5, fontSize: { xs: '1rem', md: '1.1rem' }, width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </AnimateButton>
                                <Button
                                    component={RouterLink}
                                    to="/courses"
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    sx={{ borderRadius: '50px', px: 4, py: 1.5, fontSize: { xs: '1rem', md: '1.1rem' }, width: { xs: '100%', sm: 'auto' } }}
                                >
                                    Ver Cursos
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 600,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    boxShadow: theme.shadows[10],
                                    border: `1px solid ${theme.palette.divider}`,
                                    transform: 'perspective(1000px) rotateY(-10deg) rotateX(2deg)',
                                    transition: 'transform 0.4s ease-in-out',
                                    '&:hover': {
                                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)'
                                    }
                                }}
                            >
                                <img
                                    src={landingConfig?.landing_image ? getImageUrl(landingConfig.landing_image) : dashboardPreview}
                                    alt="Panel Administrativo"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Courses Slider Section */}
            <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.light}15 0%, ${theme.palette.primary.light}15 100%)`,
                py: 8
            }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main }}>
                        Cursos Destacados
                    </Typography>
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 6 }}>
                        Explora nuestros cursos disponibles y comienza tu aprendizaje hoy
                    </Typography>

                    {loading ? (
                        <Box textAlign="center" py={8}>
                            <CircularProgress color="primary" size={60} />
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                                Cargando cursos...
                            </Typography>
                        </Box>
                    ) : courses.length > 0 ? (
                        <Box sx={{ px: { xs: 2, md: 4 } }}>
                            <Slider {...sliderSettings}>
                                {courses.map((course) => (
                                    <Box key={course.id} sx={{ p: 2 }}>
                                        <MainCard
                                            content={false}
                                            boxShadow
                                            shadow={theme.shadows[4]}
                                            border={false}
                                            sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: 4,
                                                height: '500px',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: theme.shadows[12]
                                                }
                                            }}
                                        >
                                            <Box sx={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                                                {course.image ? (
                                                    <img
                                                        src={getImageUrl(course.image)}
                                                        alt={course.subject_details?.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="h1" sx={{ fontSize: '4rem' }}>📚</Typography>
                                                    </Box>
                                                )}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)'
                                                }} />
                                            </Box>
                                            <CardContent sx={{ p: 3, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                        {course.subject_details?.name} ({course.subject_details?.code})
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: theme.palette.grey[600], fontWeight: 500, mb: 2 }}>
                                                        Paralelo {course.parallel}
                                                    </Typography>

                                                    {getScheduleItems(course.schedule).length > 0 && (
                                                        <Box sx={{ mb: 2, p: 1, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                                                            {getScheduleItems(course.schedule).map((item, idx) => (
                                                                <Typography key={idx} variant="caption" display="block" color="textSecondary" sx={{ fontWeight: 500 }}>
                                                                    {item}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, minHeight: '106px', justifyContent: 'flex-end' }}>
                                                    {course.whatsapp_link && (
                                                        <Button
                                                            variant="contained"
                                                            href={course.whatsapp_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            fullWidth
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 1.2,
                                                                fontWeight: 600,
                                                                textTransform: 'none',
                                                                fontSize: '0.95rem',
                                                                background: '#25D366',
                                                                '&:hover': { background: '#1ebe5d' }
                                                            }}
                                                        >
                                                            💬 Unirse al grupo de WhatsApp
                                                        </Button>
                                                    )}
                                                    {course.platform_link && (
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            href={course.platform_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            fullWidth
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 1.2,
                                                                fontWeight: 600,
                                                                textTransform: 'none',
                                                                fontSize: '0.95rem'
                                                            }}
                                                        >
                                                            🎓 Entrar a la Plataforma Virtual
                                                        </Button>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </MainCard>
                                    </Box>
                                ))}
                            </Slider>
                        </Box>
                    ) : (
                        <Box textAlign="center" py={10}>
                            <Typography variant="h1" sx={{ fontSize: '5rem', mb: 2, opacity: 0.3 }}>📚</Typography>
                            <Typography variant="h4" color="textSecondary" gutterBottom>
                                No hay cursos disponibles en este momento
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                                ¡Mantente atento! Pronto habrá nuevos cursos disponibles.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/"
                                variant="outlined"
                                color="primary"
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                Volver al inicio
                            </Button>
                        </Box>
                    )}

                    {courses.length > 0 && (
                        <Box textAlign="center" mt={6}>
                            <Button
                                component={RouterLink}
                                to="/courses"
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{ px: 5, py: 1.5, borderRadius: '50px', fontWeight: 600 }}
                            >
                                Ver todos los cursos
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>


            {/* About Section */}
            <Box sx={{
                background: `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
                py: 10
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="center" alignItems="center">

                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                background: theme.palette.primary.dark,
                                color: '#fff',
                                borderRadius: 4,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: theme.shadows[6]
                            }}>
                                <Box sx={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 0 100%' }} />
                                <CardContent sx={{ p: 5 }}>
                                    <Typography variant="h2" gutterBottom sx={{ color: '#fff' }}>
                                        Acerca de
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.8 }}>
                                        Bienvenido a la Plataforma EMERGENTES. Nuestra misión es facilitar la gestión académica con tecnología moderna y eficiente.
                                        <br /><br />
                                        Accede a nuestras funcionalidades desde el panel de administración gestionando cursos, proyectos y evaluaciones en un solo lugar.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={3}>
                                {[
                                    { title: 'Gestión de Cursos', desc: 'Administra inscripciones y materiales de manera sencilla.' },
                                    { title: 'Proyectos Estudiantiles', desc: 'Seguimiento y registro de avances en proyectos.' },
                                    { title: 'Evaluaciones', desc: 'Sistema de calificaciones transparente y ágil.' }
                                ].map((item, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 4, '&:hover': { borderColor: theme.palette.primary.main, background: theme.palette.primary.light } }}>
                                            <Typography variant="h4" gutterBottom color="primary">{item.title}</Typography>
                                            <Typography variant="body2" color="textSecondary">{item.desc}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Box>



            {/* Footer */}
            <LandingFooter />

        </Box>
    );
};

export default LandingPage;
