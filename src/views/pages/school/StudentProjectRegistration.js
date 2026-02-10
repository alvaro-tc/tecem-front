
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Snackbar,
    Divider,
    Paper,
    Chip,
    Alert,
    InputAdornment,
    CircularProgress,
    Box
} from '@material-ui/core';
import { IconTrash, IconUserPlus, IconCheck, IconArrowRight, IconClipboardList } from '@tabler/icons';
import axios from 'axios';
import config from '../../../config';
import MainCard from '../../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';
import LandingHeader from '../../pages/landing/LandingHeader'; // Assuming we want the header here too if public

const StudentProjectRegistration = () => {
    const theme = useTheme();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedProjectId = queryParams.get('projectId');

    const [availableProjects, setAvailableProjects] = useState([]);

    // Step 0: Select Project
    // Step 1: Form Details
    const [activeStep, setActiveStep] = useState(0);
    const [selectedProject, setSelectedProject] = useState(null);

    // Form Data
    const [leaderCi, setLeaderCi] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [isValidLeader, setIsValidLeader] = useState(false);

    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');

    const [memberCiInput, setMemberCiInput] = useState('');
    const [members, setMembers] = useState([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        axios.get(`${config.API_SERVER}project-registration/available_projects/`)
            .then(res => {
                const projects = res.data;
                setAvailableProjects(projects);

                // Pre-selection Logic
                if (preSelectedProjectId) {
                    const found = projects.find(p => p.id === parseInt(preSelectedProjectId));
                    if (found && found.is_active_time) {
                        setSelectedProject(found);
                        setActiveStep(1); // Skip selection step
                    }
                }
            })
            .catch(err => console.error(err));
    }, [preSelectedProjectId]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const checkStudent = async (ci) => {
        try {
            const res = await axios.get(`${config.API_SERVER}project-registration/validate_student/`, {
                params: { ci, sub_criterion_id: selectedProject.id }
            });
            return res.data.name;
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || 'Estudiante no encontrado o no inscrito';
            setSnackbar({ open: true, message: msg, severity: 'error' });
            return null;
        }
    };

    const handleBlurLeader = async () => {
        if (leaderCi) {
            const name = await checkStudent(leaderCi);
            if (name) {
                setLeaderName(name);
                setIsValidLeader(true);
            } else {
                setLeaderName('');
                setIsValidLeader(false);
            }
        }
    };

    const handleAddMember = async () => {
        if (memberCiInput && !members.some(m => m.ci === memberCiInput) && memberCiInput !== leaderCi) {
            if (selectedProject.max_members && (members.length + 1) >= selectedProject.max_members) {
                setSnackbar({ open: true, message: `Máximo ${selectedProject.max_members} integrantes (incluyendo líder)`, severity: 'warning' });
                return;
            }

            const name = await checkStudent(memberCiInput);
            if (name) {
                setMembers([...members, { ci: memberCiInput, name }]);
                setMemberCiInput('');
            }
        } else if (memberCiInput === leaderCi) {
            setSnackbar({ open: true, message: 'El líder ya es parte del grupo', severity: 'warning' });
        }
    };

    const handleRemoveMember = (ci) => {
        setMembers(members.filter(m => m.ci !== ci));
    };

    const handleSubmit = () => {
        setLoading(true);
        const payload = {
            sub_criterion_id: selectedProject.id,
            leader_ci: leaderCi,
            members_ci: members.map(m => m.ci),
            name: projectName,
            description: projectDesc
        };

        axios.post(`${config.API_SERVER}project-registration/register/`, payload)
            .then(res => {
                setLoading(false);
                setSuccessData(res.data);
                setActiveStep(2); // Success Step
            })
            .catch(err => {
                setLoading(false);
                const msg = err.response?.data?.error || 'Error al registrar proyecto';
                setSnackbar({ open: true, message: msg, severity: 'error' });
            });
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>Seleccione un Proyecto</Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Elija la materia y proyecto al que desea inscribirse.
                            </Typography>
                        </Grid>
                        {availableProjects.length === 0 ? (
                            <Grid item xs={12}>
                                <Alert severity="info">No hay proyectos abiertos para registro en este momento.</Alert>
                            </Grid>
                        ) : (
                            availableProjects.map((proj) => (
                                <Grid item xs={12} md={6} lg={4} key={proj.id}>
                                    <Paper
                                        elevation={selectedProject?.id === proj.id ? 4 : 1}
                                        style={{
                                            padding: 24,
                                            cursor: proj.is_active_time ? 'pointer' : 'default',
                                            border: selectedProject?.id === proj.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #eee',
                                            backgroundColor: !proj.is_active_time ? '#f5f5f5' : (selectedProject?.id === proj.id ? theme.palette.primary.light + '20' : '#fff'),
                                            opacity: proj.is_active_time ? 1 : 0.7
                                        }}
                                        onClick={() => proj.is_active_time && setSelectedProject(proj)}
                                    >
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <IconClipboardList stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />
                                            <Typography variant="h4" color={proj.is_active_time ? "primary" : "textSecondary"} style={{ marginLeft: 8 }}>
                                                {proj.course_details?.subject_details?.name || proj.course_name} - {proj.course_details?.subject_details?.code} Paralelo {proj.course_details?.parallel || 'N/A'}
                                            </Typography>
                                        </Box>

                                        <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                                            {proj.name}
                                        </Typography>

                                        <Divider style={{ margin: '12px 0' }} />
                                        <Typography variant="body2">
                                            {proj.description}
                                        </Typography>

                                        {proj.max_members && (
                                            <Chip
                                                size="small"
                                                label={`Max. ${proj.max_members} personas`}
                                                style={{ marginTop: 12, marginRight: 8 }}
                                                variant="outlined"
                                                color="primary"
                                            />
                                        )}

                                        {!proj.is_active_time && (
                                            <Chip
                                                size="small"
                                                label="Inscripción Cerrada"
                                                style={{ marginTop: 12, backgroundColor: theme.palette.error.light, color: theme.palette.error.dark }}
                                            />
                                        )}
                                        {proj.is_active_time && proj.registration_end && (
                                            <Typography variant="caption" display="block" style={{ marginTop: 8, color: theme.palette.warning.dark }}>
                                                Cierra: {new Date(proj.registration_end).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            ))
                        )}
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!selectedProject}
                                onClick={handleNext}
                                endIcon={<IconArrowRight />}
                            >
                                Siguiente
                            </Button>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Alert severity="info" style={{ marginBottom: 16 }} icon={<IconClipboardList />}>
                                Estás registrando un grupo para: <strong>{selectedProject?.name}</strong> <br />
                                Materia: <strong>{selectedProject?.course_details?.subject_details?.name || selectedProject?.course_name}</strong> (Paralelo {selectedProject?.course_details?.parallel})
                            </Alert>
                        </Grid>

                        {/* LEFT COLUMN: Form Inputs */}
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h4" gutterBottom color="primary">1. Datos del Grupo</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombre del Grupo"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Descripción (Opcional)"
                                        value={projectDesc}
                                        onChange={(e) => setProjectDesc(e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h4" gutterBottom style={{ marginTop: 16 }} color="primary">2. Líder del Grupo</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="CI del Líder (Carnet de Identidad)"
                                        value={leaderCi}
                                        onChange={(e) => {
                                            setLeaderCi(e.target.value);
                                            setIsValidLeader(false);
                                            setLeaderName('');
                                        }}
                                        onBlur={handleBlurLeader}
                                        variant="outlined"
                                        helperText={leaderName ? `Nombre: ${leaderName}` : "Debe estar inscrito en la materia"}
                                        required
                                        error={!isValidLeader && leaderCi !== '' && !leaderName}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h4" gutterBottom style={{ marginTop: 16 }} color="primary">3. Integrantes</Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Agregue el CI de los demás miembros. El sistema verificará su inscripción al agregar.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="CI del Integrante"
                                        value={memberCiInput}
                                        onChange={(e) => setMemberCiInput(e.target.value)}
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleAddMember} edge="end" color="primary">
                                                        <IconUserPlus />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                                        <Button onClick={handleBack}>Atrás</Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleSubmit}
                                            disabled={!projectName || !leaderCi || !isValidLeader || loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Registrar Grupo'}
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* RIGHT COLUMN: Selected Members List */}
                        <Grid item xs={12} md={4}>
                            <Paper variant="outlined" style={{ padding: 16, height: '100%', backgroundColor: '#fafafa' }}>
                                <Typography variant="h4" gutterBottom color="primary" align="center">
                                    Integrantes Seleccionados
                                </Typography>
                                <Divider style={{ margin: '8px 0 16px 0' }} />

                                <List dense>
                                    {leaderName ? (
                                        <ListItem>
                                            <ListItemText
                                                primary={<Typography variant="subtitle1" style={{ fontWeight: 600 }}>{leaderName}</Typography>}
                                                secondary={`CI: ${leaderCi}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <Chip size="small" label="Líder" color="primary" />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ) : (
                                        <ListItem>
                                            <ListItemText secondary="Ingrese CI del líder a la izquierda..." />
                                        </ListItem>
                                    )}

                                    <Divider component="li" style={{ margin: '8px 0' }} />

                                    {members.length === 0 && (
                                        <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 16 }}>
                                            No se han añadido integrantes adicionales.
                                        </Typography>
                                    )}

                                    {members.map((mem, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={mem.name}
                                                    secondary={`CI: ${mem.ci}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" size="small" onClick={() => handleRemoveMember(mem.ci)}>
                                                        <IconTrash size="1.2rem" stroke={1.5} color={theme.palette.error.main} />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider component="li" style={{ margin: '4px 0' }} />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container justifyContent="center" style={{ textAlign: 'center', padding: 40 }}>
                        <Grid item xs={12}>
                            <IconCheck size={64} style={{ color: theme.palette.success.main, marginBottom: 16 }} />
                            <Typography variant="h3" gutterBottom color="primary">¡Registro Exitoso!</Typography>
                            <Typography variant="h5" paragraph>
                                El grupo <strong>{projectName}</strong> ha sido registrado correctamente.
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                NOTA: Guarde el ID de su proyecto si es necesario: {successData?.project_id}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSuccessData(null);
                                    setActiveStep(0);
                                    setSelectedProject(null);
                                    setMembers([]);
                                    setLeaderCi('');
                                    setProjectName('');
                                }}
                                style={{ marginTop: 24 }}
                            >
                                Registrar Otro Proyecto
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                href="/" // Go back to Landing
                                style={{ marginTop: 24, marginLeft: 16 }}
                            >
                                Volver al Inicio
                            </Button>
                        </Grid>
                    </Grid>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <React.Fragment>
            {/* Use LandingHeader since it's a public page now */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1200 }}>
                <LandingHeader />
            </div>


            <Box sx={{
                minHeight: '100vh',
                pt: 20,
                pb: 6,
                background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.background.default} 100%)`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Abstract Background Shapes */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: theme.palette.primary.light, opacity: 0.2, zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: 100, left: -100, width: 400, height: 400, borderRadius: '50%', background: theme.palette.secondary.main, opacity: 0.1, zIndex: 0 }} />
                <Grid container justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} md={10} lg={8}>
                        <MainCard title="Registro de Grupos para Proyectos">
                            <Stepper activeStep={activeStep} alternativeLabel>
                                <Step key="Select">
                                    <StepLabel>Seleccionar Proyecto</StepLabel>
                                </Step>
                                <Step key="Form">
                                    <StepLabel>Datos del Grupo</StepLabel>
                                </Step>
                                <Step key="Confirm">
                                    <StepLabel>Confirmación</StepLabel>
                                </Step>
                            </Stepper>
                            <CardContent>
                                {renderStepContent(activeStep)}
                            </CardContent>

                            <Snackbar
                                open={snackbar.open}
                                autoHideDuration={6000}
                                onClose={() => setSnackbar({ ...snackbar, open: false })}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            >
                                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                                    {snackbar.message}
                                </Alert>
                            </Snackbar>
                        </MainCard>
                    </Grid>
                </Grid>
            </Box>
        </React.Fragment>
    );
};

export default StudentProjectRegistration;
