import React, { useState, useEffect } from 'react';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconUpload } from '@tabler/icons';
import {
    Button,
    CardContent,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Snackbar
} from '@material-ui/core';
import MuiAlert from '@material-ui/core/Alert';
import MainCard from '../../../ui-component/cards/MainCard';
import axios from 'axios';
import configData from '../../../config';
import { useSelector } from 'react-redux';
import UserDialog from './UserDialog';

const Students = () => {
    const account = useSelector((state) => state.account);
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Bulk Upload State
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ to_create: [], existing: [] });
    const [loading, setLoading] = useState(false);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const fetchStudents = () => {
        if (account.token) {
            axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
            axios.get(configData.API_SERVER + 'manage-users', { params: { role: 'STUDENT' } })
                .then(response => {
                    setStudents(response.data);
                })
                .catch(error => console.error("Error fetching students", error));
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account.token]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const handleAdd = () => {
        setSelectedStudent(null);
        setOpenDialog(true);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setOpenDialog(true);
    };

    const handleDelete = (id) => {
        setStudentToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
            await axios.delete(`${configData.API_SERVER}manage-users/${studentToDelete}`);
            fetchStudents();
            setOpenDeleteDialog(false);
            setStudentToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.post(`${configData.API_SERVER}manage-users/preview_bulk_create/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                setPreviewData(response.data);
                setPreviewOpen(true);
                setLoading(false);
                event.target.value = null;
            })
            .catch(err => {
                setLoading(false);
                const msg = err.response?.data?.error || 'Error al procesar archivo';
                showSnackbar(msg, 'error');
                event.target.value = null;
            });
    };

    const handleConfirmCreate = (studentsToProcess, actionType) => {
        if (!studentsToProcess || studentsToProcess.length === 0) return;

        setLoading(true);
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
        axios.post(`${configData.API_SERVER}manage-users/confirm_bulk_create/`, {
            students: studentsToProcess
        })
            .then(response => {
                const { created, updated } = response.data;
                let msg = '';
                if (actionType === 'CREATE') msg = `Se crearon ${created} estudiantes nuevos.`;
                else if (actionType === 'UPDATE') msg = `Se actualizaron ${updated} estudiantes existentes.`;
                else msg = `Proceso completado: ${created} creados, ${updated} actualizados.`;

                showSnackbar(msg, 'success');
                setPreviewOpen(false);
                fetchStudents();
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.error("Bulk create error:", err.response?.data || err);
                const msg = err.response?.data?.error || 'Error al procesar estudiantes';
                showSnackbar(msg, 'error');
            });
    };

    const filteredStudents = students.filter(student =>
        (student.first_name && student.first_name.toLowerCase().includes(search.toLowerCase())) ||
        (student.paternal_surname && student.paternal_surname.toLowerCase().includes(search.toLowerCase())) ||
        (student.ci_number && student.ci_number.toLowerCase().includes(search.toLowerCase())) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <MainCard title="Estudiantes" content={false}>
            <CardContent>
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item>
                        <OutlinedInput
                            id="input-search-students"
                            placeholder="Buscar"
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconSearch stroke={1.5} size="1rem" />
                                </InputAdornment>
                            }
                            size="small"
                            value={search}
                            onChange={handleSearch}
                        />
                    </Grid>
                    <Grid item>
                        <input
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            style={{ display: 'none' }}
                            id="btn-upload-students"
                            type="file"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="btn-upload-students">
                            <Button variant="outlined" component="span" startIcon={<IconUpload />} style={{ marginRight: 8 }}>
                                Subir Excel
                            </Button>
                        </label>
                        <Button variant="contained" color="secondary" startIcon={<IconPlus />} onClick={handleAdd}>
                            Añadir Estudiante
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Paterno</TableCell>
                            <TableCell>Materno</TableCell>
                            <TableCell>Nombres</TableCell>
                            <TableCell>CI</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((student) => (
                                <TableRow key={student.id} hover>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.paternal_surname || ''}</TableCell>
                                    <TableCell>{student.maternal_surname || ''}</TableCell>
                                    <TableCell>{student.first_name || ''}</TableCell>
                                    <TableCell>{student.ci_number || '-'}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(student)} size="small">
                                            <IconEdit size="1.3rem" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(student.id)} size="small" color="error">
                                            <IconTrash size="1.3rem" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        {filteredStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No se encontraron registros
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Eliminar Estudiante</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar este estudiante? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="secondary" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
            <UserDialog
                open={openDialog}
                handleClose={() => setOpenDialog(false)}
                user={selectedStudent}
                role="STUDENT"
                onSave={fetchStudents}
            />

            {/* PREVIEW DIALOG */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Vista Previa de Registro Masivo</DialogTitle>
                <DialogContent>
                    <Typography variant="h4" gutterBottom>
                        Por Registrar ({previewData.to_create.length})
                    </Typography>
                    <TableContainer style={{ maxHeight: 300, marginBottom: 20 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>CI</TableCell>
                                    <TableCell>Paterno</TableCell>
                                    <TableCell>Materno</TableCell>
                                    <TableCell>Nombres</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewData.to_create.map((s, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{s.ci_number}</TableCell>
                                        <TableCell>{s.paternal_surname}</TableCell>
                                        <TableCell>{s.maternal_surname}</TableCell>
                                        <TableCell>{s.first_name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {previewData.existing.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="h5" color="primary" gutterBottom>
                                Actualizar Existentes ({previewData.existing.length})
                            </Typography>
                            <TableContainer style={{ maxHeight: 150, backgroundColor: '#e3f2fd' }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>CI</TableCell>
                                            <TableCell>Paterno</TableCell>
                                            <TableCell>Materno</TableCell>
                                            <TableCell>Nombres</TableCell>
                                            <TableCell>Email (Nuevo)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewData.existing.map((s, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{s.ci_number}</TableCell>
                                                <TableCell>{s.paternal_surname}</TableCell>
                                                <TableCell>{s.maternal_surname}</TableCell>
                                                <TableCell>{s.first_name}</TableCell>
                                                <TableCell>{s.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)} color="primary">
                        Cancelar
                    </Button>

                    {previewData.existing.length > 0 && (
                        <Button
                            onClick={() => handleConfirmCreate(previewData.existing, 'UPDATE')}
                            color="primary"
                            variant="outlined"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : `Actualizar ${previewData.existing.length} Existentes`}
                        </Button>
                    )}

                    {previewData.to_create.length > 0 && (
                        <Button
                            onClick={() => handleConfirmCreate(previewData.to_create, 'CREATE')}
                            color="secondary"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : `Registrar ${previewData.to_create.length} Nuevos`}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </MainCard>
    );
};

export default Students;
