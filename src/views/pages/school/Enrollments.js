import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Alert, Snackbar, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Box, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/core'; // Standard Material UI Autocomplete
import MainCard from '../../../ui-component/cards/MainCard';
import { IconTrash, IconUserPlus, IconUpload, IconUsers } from '@tabler/icons';
import axios from 'axios';
import configData from '../../../config';
import CourseRequestsDialog from './CourseRequestsDialog';

const Enrollments = () => {
    // const theme = useTheme(); // Unused
    const account = useSelector((state) => state.account);
    const activeCourse = useSelector((state) => state.account.activeCourse);

    const [enrollments, setEnrollments] = useState([]);

    // Autocomplete State
    const [studentOptions, setStudentOptions] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [inputValue, setInputValue] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Preview State
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ found: [], not_found: [] });

    // Requests Dialog State
    const [openRequestsDialog, setOpenRequestsDialog] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingRequests = () => {
        if (!activeCourse) return;
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.get(`${configData.API_SERVER}registration-requests/`, {
            params: {
                course_id: activeCourse.id,
                status: 'PENDING'
            }
        })
            .then(response => {
                // Assuming response.data is an array based on CourseRequestsDialog usage
                const data = response.data.results || response.data;
                setPendingCount(data.length);
            })
            .catch(error => console.error("Error fetching pending requests:", error));
    };

    const fetchEnrollments = () => {
        if (!activeCourse) return;
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.get(`${configData.API_SERVER}enrollments/?course=${activeCourse.id}`)
            .then(response => {
                setEnrollments(response.data);
            })
            .catch(error => {
                console.error("Error fetching enrollments:", error);
            });
    };

    useEffect(() => {
        if (activeCourse) {
            fetchEnrollments();
            fetchPendingRequests();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCourse]);

    // Handle Student Search
    useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setStudentOptions(selectedStudent ? [selectedStudent] : []);
            return undefined;
        }

        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.get(`${configData.API_SERVER}manage-users/?role=STUDENT&search=${inputValue}`)
            .then(response => {
                if (active) {
                    setStudentOptions(response.data.results || response.data);
                }
            })
            .catch(err => console.error(err));

        return () => {
            active = false;
        };
    }, [inputValue, account.token, selectedStudent]);

    const handleEnroll = () => {
        if (!selectedStudent) return;

        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.post(`${configData.API_SERVER}enrollments/`, {
            student: selectedStudent.id,
            course: activeCourse.id
        })
            .then(() => {
                setSnackbar({ open: true, message: 'Estudiante inscrito correctamente', severity: 'success' });
                fetchEnrollments();
                setSelectedStudent(null);
            })
            .catch(err => {
                const msg = err.response?.data?.non_field_errors?.[0] || "Error al inscribir. Posiblemente ya está inscrito.";
                setSnackbar({ open: true, message: msg, severity: 'error' });
            });
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

    const handleDelete = (id) => {
        setEnrollmentToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!enrollmentToDelete) return;

        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.delete(`${configData.API_SERVER}enrollments/${enrollmentToDelete}/`)
            .then(() => {
                setSnackbar({ open: true, message: 'Inscripción eliminada', severity: 'success' });
                fetchEnrollments();
                setOpenDeleteDialog(false);
                setEnrollmentToDelete(null);
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error al eliminar inscripción', severity: 'error' });
            });
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_id', activeCourse.id);

        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.post(`${configData.API_SERVER}enrollments/preview_bulk_upload/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                setPreviewData(response.data);
                setPreviewOpen(true);
                event.target.value = null; // Reset input
            })
            .catch(err => {
                setSnackbar({ open: true, message: 'Error al analizar archivo', severity: 'error' });
                event.target.value = null;
            });
    };

    const handleConfirmEnrollment = () => {
        // IDs of existing students found
        const existingStudentIds = previewData.found.filter(s => !s.is_enrolled).map(s => s.id);
        const studentsToCreate = previewData.to_create || [];

        if (existingStudentIds.length === 0 && studentsToCreate.length === 0) {
            setSnackbar({ open: true, message: 'No hay estudiantes nuevos para inscribir', severity: 'info' });
            setPreviewOpen(false);
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.post(`${configData.API_SERVER}enrollments/confirm_bulk_enrollment/`, {
            course_id: activeCourse.id,
            student_ids: existingStudentIds,
            students_to_create: studentsToCreate
        })
            .then(response => {
                const { enrolled_count, created_users_count } = response.data;
                setSnackbar({
                    open: true,
                    message: `Proceso finalizado. Creados: ${created_users_count || 0}. Inscritos: ${enrolled_count}`,
                    severity: 'success'
                });
                setPreviewOpen(false);
                fetchEnrollments();
            })
            .catch(err => {
                setSnackbar({ open: true, message: 'Error al confirmar inscripción', severity: 'error' });
            });
    };

    const handleCheckSingleCI = (ci, index) => {
        if (!ci) return;
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;

        // 1. Search User
        axios.get(`${configData.API_SERVER}manage-users/?role=STUDENT&search=${ci}`)
            .then(response => {
                const results = response.data.results || response.data;
                const student = results.find(s => s.ci_number === ci); // Strict check

                if (student) {
                    // 2. Check Enrollment Status
                    axios.get(`${configData.API_SERVER}enrollments/?student=${student.id}&course=${activeCourse.id}`)
                        .then(enrollResponse => {
                            const isEnrolled = enrollResponse.data.length > 0;

                            const newStudent = {
                                ...student,
                                is_enrolled: isEnrolled
                            };

                            // Move to found
                            setPreviewData(prev => ({
                                ...prev,
                                found: [...prev.found, newStudent],
                                not_found: prev.not_found.filter((_, i) => i !== index)
                            }));
                            setSnackbar({ open: true, message: 'Estudiante encontrado', severity: 'success' });
                        })
                        .finally(() => { });
                } else {
                    setSnackbar({ open: true, message: 'Estudiante no encontrado con ese CI', severity: 'warning' });
                }
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error al buscar estudiante', severity: 'error' });
            });
    };

    if (!activeCourse) {
        return (
            <MainCard title="Inscripciones">
                <Typography variant="h6" align="center">
                    Seleccione un curso para ver las inscripciones.
                </Typography>
            </MainCard>
        );
    }

    return (
        <MainCard title={`Inscripciones - ${activeCourse.subject_details?.name} (${activeCourse.parallel})`}>

            {/* Enrollment Form */}
            <Grid container spacing={3} alignItems="center" style={{ marginBottom: 24 }}>
                <Grid item xs={12} md={5}>
                    <Autocomplete
                        id="student-select"
                        options={studentOptions}
                        getOptionLabel={(option) => `${option.paternal_surname || ''} ${option.maternal_surname || ''} ${option.first_name || ''} (${option.ci_number})`}
                        filterOptions={(x) => x}
                        value={selectedStudent}
                        onChange={(event, newValue) => {
                            setSelectedStudent(newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                            setInputValue(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar Estudiante (Apellidos, CI)"
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<IconUserPlus />}
                        onClick={handleEnroll}
                        disabled={!selectedStudent}
                    >
                        Inscribir
                    </Button>
                </Grid>
                <Grid item>
                    <input
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<IconUpload />}>
                            Subir Excel
                        </Button>
                    </label>
                </Grid>
                {(activeCourse?.is_registration_open === true || pendingCount > 0) && (
                    <Grid item>
                        <Button
                            variant="contained"
                            // color="default" <--- Removed invalid prop for v5
                            startIcon={<IconUsers />}
                            onClick={() => setOpenRequestsDialog(true)}
                            style={{ backgroundColor: '#e0e0e0', color: '#333' }} // Explicit grey and dark text
                        >
                            Aceptar Inscripciones {pendingCount > 0 ? `(${pendingCount})` : ''}
                        </Button>
                    </Grid>
                )}
            </Grid>

            <Divider style={{ marginBottom: 24 }} />

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>CI</TableCell>
                            <TableCell>Paterno</TableCell>
                            <TableCell>Materno</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell align="right">Fecha Inscripción</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {enrollments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No hay estudiantes inscritos.</TableCell>
                            </TableRow>
                        ) : (
                            enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell>{enrollment.student_details?.ci_number || 'N/A'}</TableCell>
                                    <TableCell>{enrollment.student_details?.paternal_surname}</TableCell>
                                    <TableCell>{enrollment.student_details?.maternal_surname}</TableCell>
                                    <TableCell>{enrollment.student_details?.first_name}</TableCell>
                                    <TableCell>{enrollment.student_details?.email}</TableCell>
                                    <TableCell align="right">{enrollment.date_enrolled}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="error" onClick={() => handleDelete(enrollment.id)}>
                                            <IconTrash size="1.1rem" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PREVIEW DIALOG */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Vista Previa de Carga Masiva</DialogTitle>
                <DialogContent>

                    {/* SECTION 1: EXISTING STUDENTS FOUND */}
                    <Box mb={4}>
                        <Typography variant="h4" gutterBottom>
                            Estudiantes Existentes ({previewData.found ? previewData.found.length : 0})
                        </Typography>
                        {(previewData.found && previewData.found.length > 0) ? (
                            <TableContainer style={{ maxHeight: 200, marginBottom: 20 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>CI</TableCell>
                                            <TableCell>Paterno</TableCell>
                                            <TableCell>Materno</TableCell>
                                            <TableCell>Nombre</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewData.found.map((s) => (
                                            <TableRow key={s.ci_number} style={{ backgroundColor: s.is_enrolled ? '#e0e0e0' : '#e8f5e9' }}>
                                                <TableCell>
                                                    {s.is_enrolled ? (
                                                        <Typography color="textSecondary" variant="caption">Ya Inscrito</Typography>
                                                    ) : (
                                                        <Typography color="primary" variant="caption" style={{ fontWeight: 'bold' }}>Se Inscribirá</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>{s.ci_number}</TableCell>
                                                <TableCell>{s.paternal_surname}</TableCell>
                                                <TableCell>{s.maternal_surname}</TableCell>
                                                <TableCell>{s.first_name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="textSecondary" variant="body2">No se encontraron estudiantes ya registrados en el sistema.</Typography>
                        )}
                    </Box>

                    {/* SECTION 2: NEW STUDENTS TO CREATE */}
                    <Box mb={4}>
                        <Typography variant="h4" color="secondary" gutterBottom>
                            Nuevos Estudiantes a Crear ({previewData.to_create ? previewData.to_create.length : 0})
                        </Typography>
                        <Typography variant="caption" display="block" gutterBottom>
                            Estos estudiantes NO existen en el sistema. Se crearán automáticamente y luego se inscribirán.
                        </Typography>

                        {(previewData.to_create && previewData.to_create.length > 0) ? (
                            <TableContainer style={{ maxHeight: 200 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>CI</TableCell>
                                            <TableCell>Paterno</TableCell>
                                            <TableCell>Materno</TableCell>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Celular</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewData.to_create.map((s, idx) => (
                                            <TableRow key={idx} style={{ backgroundColor: '#fff3e0' }}>
                                                <TableCell>{s.ci_number}</TableCell>
                                                <TableCell>{s.paternal_surname}</TableCell>
                                                <TableCell>{s.maternal_surname}</TableCell>
                                                <TableCell>{s.first_name}</TableCell>
                                                <TableCell>{s.email}</TableCell>
                                                <TableCell>{s.phone}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="textSecondary" variant="body2">No hay nuevos estudiantes para crear.</Typography>
                        )}
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmEnrollment}
                        color="secondary"
                        variant="contained"
                        disabled={
                            (!previewData.found || previewData.found.length === 0) &&
                            (!previewData.to_create || previewData.to_create.length === 0)
                        }
                    >
                        Confirmar y Procesar
                    </Button>
                </DialogActions>
            </Dialog>

            <CourseRequestsDialog
                open={openRequestsDialog}
                handleClose={() => setOpenRequestsDialog(false)}
                course={activeCourse}
                onUpdate={() => {
                    fetchEnrollments();
                    fetchPendingRequests();
                }}
            />

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea eliminar a este estudiante del curso?
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Esta acción removerá la inscripción y todas las calificaciones asociadas.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="secondary" variant="contained" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainCard>
    );
};

export default Enrollments;
