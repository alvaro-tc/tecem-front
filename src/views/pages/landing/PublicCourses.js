import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import {
    Button,
    Grid,
    Typography,
    Container,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    Snackbar,
    IconButton
} from '@material-ui/core';
import { IconBook, IconCheck, IconX } from '@tabler/icons';

// project imports
import LandingHeader from './LandingHeader';
import axios from 'axios';
import configData from '../../../config';
import MainCard from '../../../ui-component/cards/MainCard';
import { formatSchedule, getScheduleItems } from '../../../utils/scheduleUtils';

const PublicCourses = () => {
    // Force rebuild
    const theme = useTheme();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [openModal, setOpenModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [form, setForm] = useState({
        ci: '',
        first_name: '',
        paternal_surname: '',
        maternal_surname: '',
        email: '',
        cellphone: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
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

        fetchCourses();
    }, []);

    const handleRegisterClick = (course) => {
        setSelectedCourse(course);
        setOpenModal(true);
        setSuccess(false);
        setForm({
            ci: '',
            first_name: '',
            paternal_surname: '',
            maternal_surname: '',
            email: '',
            cellphone: ''
        });
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCourse(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                course: selectedCourse.id,
                ...form
            };
            await axios.post(`${configData.API_SERVER}student-course-registration/submit_request/`, payload);
            setSuccess(true);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || 'Error al enviar la solicitud';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to construct full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath; // Already absolute

        // Remove '/api/' from API_SERVER to get base host
        const baseHost = configData.API_SERVER.replace(/\/api\/$/, '');
        // Ensure imagePath starts with /
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseHost}${path}`;
    };

    return (
        <React.Fragment>
            <Box sx={{
                minHeight: '100vh',
                pt: 0,
                pb: 6,
                background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.background.default} 100%)`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <LandingHeader />
                <Box sx={{ pt: 12 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" gutterBottom color="primary" sx={{ fontSize: '3rem', fontWeight: 700 }}>
                            Cursos Disponibles
                        </Typography>
                        <Typography variant="h4" color="textSecondary" sx={{ fontWeight: 400 }}>
                            Explora e inscríbete en las materias habilitadas para este periodo
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress color="secondary" />
                        </Box>
                    ) : (
                        <Grid container spacing={4} justifyContent="center">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <Grid item key={course.id} xs={12} sm={6} md={4}>
                                        <MainCard
                                            border={false}
                                            boxShadow
                                            shadow={theme.shadows[10]}
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'translateY(-8px)' }
                                            }}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                {course.image ? (
                                                    <img
                                                        src={getImageUrl(course.image)}
                                                        alt={course.subject_details?.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '180px',
                                                            objectFit: 'cover',
                                                            borderTopLeftRadius: '8px',
                                                            borderTopRightRadius: '8px'
                                                        }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        height: '180px',
                                                        background: theme.palette.secondary.light,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderTopLeftRadius: '8px',
                                                        borderTopRightRadius: '8px'
                                                    }}>
                                                        <IconBook size={64} color={theme.palette.secondary.dark} />
                                                    </Box>
                                                )}
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box>
                                                    {/* Subject Name with Code */}
                                                    <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                        {course.subject_details?.name} ({course.subject_details?.code})
                                                    </Typography>

                                                    {/* Parallel */}
                                                    <Typography variant="body1" sx={{ color: theme.palette.grey[600], fontWeight: 500, mb: 2 }}>
                                                        Paralelo {course.parallel}
                                                    </Typography>

                                                    {/* Schedule info */}
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

                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="secondary"
                                                    size="large"
                                                    sx={{ borderRadius: 2, py: 1.2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                                                    onClick={() => handleRegisterClick(course)}
                                                >
                                                    Inscribirse Ahora
                                                </Button>
                                            </CardContent>
                                        </MainCard>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box textAlign="center" py={10}>
                                        <Typography variant="h3" color="textSecondary">
                                            No hay cursos abiertos para inscripción en este momento.
                                        </Typography>
                                        <Button component={RouterLink} to="/" variant="text" sx={{ mt: 2 }}>
                                            Volver al inicio
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Container>

                {/* Simple Footer */}
                <Box sx={{ textAlign: 'center', py: 4, margin: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="textSecondary">
                        © 2026 Plataforma Emergentes
                    </Typography>
                </Box>
            </Box>

            {/* Registration Dialog */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', pb: 1 }}>
                    Inscripción al Curso
                </DialogTitle>
                <DialogContent>
                    {selectedCourse && (
                        <Box mb={3} p={3} sx={{
                            bgcolor: theme.palette.primary.light + '20',
                            borderRadius: 3,
                            textAlign: 'center',
                            border: `2px solid ${theme.palette.primary.main}30`
                        }}>
                            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                                {selectedCourse.subject_details?.name}
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                                {selectedCourse.subject_details?.code}
                            </Typography>
                            <Box mt={1} display="flex" gap={1} justifyContent="center">
                                <Chip label={`Paralelo ${selectedCourse.parallel}`} color="secondary" sx={{ fontWeight: 600 }} />
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                    {getScheduleItems(selectedCourse.schedule).map((item, idx) => (
                                        <Chip key={idx} label={item} size="small" />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                                        Por favor completa tus datos para solicitar la inscripción
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Carnet de Identidad"
                                        name="ci"
                                        value={form.ci}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Paterno"
                                        name="paternal_surname"
                                        value={form.paternal_surname}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Apellido Materno"
                                        name="maternal_surname"
                                        value={form.maternal_surname}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Correo Electrónico"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono/Celular"
                                        name="cellphone"
                                        value={form.cellphone}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                            <DialogActions sx={{ px: 0, pt: 3, gap: 1 }}>
                                <Button
                                    onClick={handleCloseModal}
                                    variant="outlined"
                                    sx={{ borderRadius: 2, px: 3 }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    disabled={submitting}
                                    sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}
                                >
                                    {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                                </Button>
                            </DialogActions>
                        </form>
                    ) : (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>✅</Typography>
                            <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                                ¡Solicitud Enviada!
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                                Tu solicitud de inscripción ha sido enviada correctamente. Recibirás una confirmación pronto.
                            </Typography>
                            <Button
                                onClick={handleCloseModal}
                                variant="contained"
                                color="secondary"
                                sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}
                            >
                                Cerrar
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snackbar Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </React.Fragment >
    );
};

export default PublicCourses;
