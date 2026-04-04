import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Snackbar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    Fab,
    Menu
} from '@material-ui/core';
import MuiAlert from '@material-ui/core/Alert';
import { IconPlus, IconDeviceFloppy, IconPencil, IconTrash, IconSettings, IconLock, IconLockOpen, IconEye, IconEyeOff, IconChevronDown } from '@tabler/icons';
import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery, Checkbox } from '@material-ui/core';
import MainCard from './../../../ui-component/cards/MainCard';
import axios from 'axios';
import configData from '../../../config';
import { useSelector } from 'react-redux';
import TaskDialog from './TaskDialog';

const TaskGrading = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const account = useSelector((state) => state.account);
    const activeCourse = useSelector((state) => state.account.activeCourse);
    const location = useLocation();

    const [subCriteria, setSubCriteria] = useState([]);
    const [specialCriteria, setSpecialCriteria] = useState([]);
    const [selectedSubCrit, setSelectedSubCrit] = useState('');

    // Task Data
    const [tasks, setTasks] = useState([]);
    const visibleTasks = tasks.filter(t => t.is_public);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [changes, setChanges] = useState({});

    // UI State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [openUndoDialog, setOpenUndoDialog] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState({}); // { enrollmentId-taskId: true }

    const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);

    // Mobile grading modal state
    const [mobileModalOpen, setMobileModalOpen] = useState(false);
    const [mobileSelectedRow, setMobileSelectedRow] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [search, setSearch] = useState('');

    // Bulk Grading State
    const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
    const [selectedTaskForBulk, setSelectedTaskForBulk] = useState(null);

    // Task Editing State (Manage Dialog)
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState({ name: '', weight: 1 });

    const LETTER_SCORES = {
        'A': 1.0,
        'B': 0.75,
        'C': 0.5,
        'D': 0.25,
        'E': 0.0
    };

    const getLetterFromScore = (score) => {
        if (score === null || score === undefined || score === '') return null;
        const s = parseFloat(score);
        if (s >= 1.0) return 'A';
        if (s >= 0.75) return 'B';
        if (s >= 0.5) return 'C';
        if (s >= 0.25) return 'D';
        return 'E';
    };

    useEffect(() => {
        if (activeCourse) {
            fetchSubCriteria();
            setRows([]);
            setTasks([]);
            // Don't reset selectedSubCrit here if it was set by URL param logic
            if (!location.search) {
                setSelectedSubCrit('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCourse]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const subCritId = params.get('sub_criterion_id');
        if (subCritId) {
            // Keep as string if it's a special criterion, otherwise parse to int
            const isSpecial = String(subCritId).startsWith('special-');
            setSelectedSubCrit(isSpecial ? subCritId : parseInt(subCritId));
        }
    }, [location.search]);

    useEffect(() => {
        if (activeCourse && selectedSubCrit) {
            fetchTaskSheet();
            // Save preference
            axios.post(`${configData.API_SERVER}courses/${activeCourse.id}/set_preference/`, {
                last_viewed_tab: selectedSubCrit
            }).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubCrit]);

    // Load Preference on Mount/Course Change
    useEffect(() => {
        if (activeCourse && !selectedSubCrit && !location.search) {
            axios.get(`${configData.API_SERVER}courses/${activeCourse.id}/preference/`)
                .then(res => {
                    const lastTab = res.data.last_viewed_tab;
                    if (lastTab) {
                        // Check if it's special
                        const isSpecial = String(lastTab).startsWith('special-');
                        setSelectedSubCrit(isSpecial ? lastTab : parseInt(lastTab));
                    }
                })
                .catch(console.error);
        }
    }, [activeCourse]);

    const saveSingleScore = (enrollmentId, taskId, score) => {
        // Optimistic update is already done in handleGradeClick via setRows
        // Now send to backend
        axios.post(`${configData.API_SERVER}task-scores/bulk_save/`, {
            updates: [{
                enrollment_id: enrollmentId,
                task_id: taskId,
                score: score
            }]
        })
            .then(() => {
                // Success feedback (maybe too noisy if strictly every click, but good for confirmation)
                // setSnackbar({ open: true, message: 'Nota guardada', severity: 'success' });
                // Recalculate averages in UI? 
                // The backend recalculates, but frontend 'rows' averages are computed in render
                // row.scores is updated, so average should update automatically on next render!
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error guardando nota', severity: 'error' });
                // Revert? Complex.
            });
    };

    const fetchSubCriteria = () => {
        axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;

        // Fetch regular sub-criteria
        const subCriteriaReq = axios.get(`${configData.API_SERVER}course-sub-criteria/?course=${activeCourse.id}`);

        // Fetch special criteria (puntos extra)
        const specialCriteriaReq = axios.get(`${configData.API_SERVER}course-special-criteria/?course=${activeCourse.id}`);

        Promise.all([subCriteriaReq, specialCriteriaReq])
            .then(([subRes, specialRes]) => {
                setSubCriteria(subRes.data);
                setSpecialCriteria(specialRes.data);
            })
            .catch(err => console.error(err));
    };

    const fetchTaskSheet = () => {
        setLoading(true);
        axios.get(`${configData.API_SERVER}task-scores/task_sheet/?course_id=${activeCourse.id}&sub_criterion_id=${selectedSubCrit}`)
            .then(res => {
                setTasks(res.data.tasks);
                setRows(res.data.rows);
                setChanges({});
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error cargando tareas', severity: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const handleAddTask = (taskData) => {
        setLoading(true);

        // Determine if it's a special criterion
        const isSpecial = String(selectedSubCrit).startsWith('special-');
        const payload = {
            ...taskData
        };

        if (isSpecial) {
            const actualId = selectedSubCrit.replace('special-', '');
            payload.special_criterion = parseInt(actualId);
        } else {
            payload.sub_criterion = parseInt(selectedSubCrit);
        }

        axios.post(`${configData.API_SERVER}course-tasks/`, payload)
            .then(() => {
                setDialogOpen(false);
                fetchTaskSheet();
                setSnackbar({ open: true, message: 'Tarea creada', severity: 'success' });
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error creando tarea', severity: 'error' });
                setLoading(false);
            });
    };

    const handleUpdateTask = () => {
        if (!editTaskData.name) return;
        setLoading(true);

        // Determine if it's a special criterion
        const isSpecial = String(selectedSubCrit).startsWith('special-');
        const payload = {
            ...editTaskData
        };

        if (isSpecial) {
            const actualId = selectedSubCrit.replace('special-', '');
            payload.special_criterion = parseInt(actualId);
        } else {
            payload.sub_criterion = parseInt(selectedSubCrit);
        }

        axios.put(`${configData.API_SERVER}course-tasks/${editingTaskId}/`, payload)
            .then(() => {
                setSnackbar({ open: true, message: 'Tarea actualizada', severity: 'success' });
                setEditingTaskId(null);
                fetchTaskSheet();
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error actualizando tarea', severity: 'error' });
                setLoading(false);
            });
    };

    const startEditingTask = (task) => {
        setEditingTaskId(task.id);
        setEditTaskData({
            name: task.name,
            weight: task.weight
        });
    };

    const cancelEditingTask = () => {
        setEditingTaskId(null);
        setEditTaskData({ name: '', weight: 1 });
    };

    const handleToggleTaskField = (task, field) => {
        const newValue = !task[field];
        setLoading(true);
        axios.patch(`${configData.API_SERVER}course-tasks/${task.id}/`, {
            [field]: newValue
        })
            .then(() => {
                setSnackbar({ open: true, message: 'Estado actualizado', severity: 'success' });
                // Optimistic UI Update or Refetch
                // Since this runs on the Dialog, refetch is safer to ensure sync
                fetchTaskSheet();
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error actualizando estado', severity: 'error' });
                setLoading(false);
            });
    };

    const handleDeleteTask = (taskId) => {
        if (!window.confirm('¿Está seguro de eliminar esta tarea? Se recalcularán los promedios automáticamente.')) return;

        setLoading(true);
        axios.delete(`${configData.API_SERVER}course-tasks/${taskId}/`)
            .then(() => {
                setSnackbar({ open: true, message: 'Tarea eliminada', severity: 'success' });
                fetchTaskSheet(); // This will reflect updated averages
                // If no tasks remain, close dialog
                if (tasks.length <= 1) setDeleteDialogOpen(false);
            })
            .catch(err => {
                console.error(err);
                setSnackbar({ open: true, message: 'Error eliminando tarea', severity: 'error' });
                setLoading(false);
            });
    };

    const handleBulkMenuOpen = (event, taskId) => {
        setBulkMenuAnchor(event.currentTarget);
        setSelectedTaskForBulk(taskId);
    };

    const handleBulkMenuClose = () => {
        setBulkMenuAnchor(null);
        setSelectedTaskForBulk(null);
    };

    const handleBulkGrade = (letter) => {
        if (!selectedTaskForBulk) return;
        const value = LETTER_SCORES[letter];
        const taskId = selectedTaskForBulk;

        // Update all rows for this task
        setRows(prevRows => prevRows.map(row => ({
            ...row,
            scores: {
                ...row.scores,
                [taskId]: value
            }
        })));

        // Update changes for all rows logic
        const newChanges = { ...changes };
        rows.forEach(row => {
            newChanges[`${row.enrollment_id}-${taskId}`] = value;
        });
        setChanges(newChanges);

        handleBulkMenuClose();
        setSnackbar({ open: true, message: `Todas las notas establecidas a ${letter}`, severity: 'info' });
    };

    const handleScoreChange = (enrollmentId, taskId, value) => {
        setRows(prevRows => prevRows.map(row => {
            if (row.enrollment_id === enrollmentId) {
                return {
                    ...row,
                    scores: {
                        ...row.scores,
                        [taskId]: value
                    }
                };
            }
            return row;
        }));

        setChanges(prev => ({
            ...prev,
            [`${enrollmentId}-${taskId}`]: value
        }));
    };

    const handleGradeClick = (enrollmentId, taskId, letter) => {
        const value = LETTER_SCORES[letter];
        handleScoreChange(enrollmentId, taskId, value);
        saveSingleScore(enrollmentId, taskId, value);
        // Turn off edit mode if it was on
        setEditMode(prev => {
            const newState = { ...prev };
            delete newState[`${enrollmentId}-${taskId}`];
            return newState;
        });
    };

    const toggleEditMode = (enrollmentId, taskId) => {
        setEditMode(prev => ({
            ...prev,
            [`${enrollmentId}-${taskId}`]: true
        }));
    };

    const handleSave = () => {
        const updates = Object.keys(changes).map(key => {
            const [enrollmentId, taskId] = key.split('-');
            return {
                enrollment_id: parseInt(enrollmentId),
                task_id: parseInt(taskId),
                score: parseFloat(changes[key]) || 0
            };
        });

        if (updates.length === 0) return;

        setLoading(true);
        axios.post(`${configData.API_SERVER}task-scores/bulk_save/`, { updates })
            .then(() => {
                setSnackbar({ open: true, message: 'Notas guardadas correctamente', severity: 'success' });
                setChanges({});
                // Optional: Refetch to see updated averages if we display them
            })
            .catch(error => {
                console.error(error);
                setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleUndo = () => {
        if (Object.keys(changes).length === 0) return;
        setOpenUndoDialog(true);
    };

    const handleConfirmUndo = () => {
        setChanges({});
        setOpenUndoDialog(false);
        fetchTaskSheet();
    };

    if (!activeCourse) {
        return (
            <MainCard title="Calificación de Tareas">
                <MuiAlert severity="warning">Seleccione un Paralelo para comenzar.</MuiAlert>
            </MainCard>
        );
    }

    const filteredRows = rows.filter(row => {
        const term = search.toLowerCase();
        return (
            (row.paterno || '').toLowerCase().includes(term) ||
            (row.materno || '').toLowerCase().includes(term) ||
            (row.nombre || '').toLowerCase().includes(term) ||
            (row.ci || '').toLowerCase().includes(term)
        );
    });

    return (
        <MainCard title={`Calificación de Tareas - ${activeCourse.subject_details?.name} (${activeCourse.parallel})`}>
            {/* Header Controls */}
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" style={{ marginBottom: 20 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Sub-Criterio de Evaluación</InputLabel>
                        <Select
                            value={selectedSubCrit}
                            onChange={(e) => setSelectedSubCrit(e.target.value)}
                            label="Sub-Criterio de Evaluación"
                        >
                            <MenuItem value=""><em>Seleccione...</em></MenuItem>
                            {subCriteria.map(sc => (
                                <MenuItem key={sc.id} value={sc.id}>
                                    {sc.parent_criterion_details?.name} - {sc.name} ({sc.percentage}%)
                                </MenuItem>
                            ))}
                            {specialCriteria.map(sc => (
                                <MenuItem key={`special-${sc.id}`} value={`special-${sc.id}`}>
                                    ⭐ {sc.parent_criterion_details?.name} - {sc.name} (+{sc.percentage} pts) [Extra]
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                {selectedSubCrit && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar estudiante..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                        />
                    </Grid>
                )}
            </Grid>

            {/* Tasks Table or Mobile View */}
            {selectedSubCrit && (
                isMobile ? (
                    <List style={{ marginTop: 10, padding: 0 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 20 }}><CircularProgress /></div>
                        ) : filteredRows.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>No hay estudiantes o tareas.</div>
                        ) : (
                            filteredRows.map((row, index) => {
                                let totalWeight = 0;
                                let weightedSum = 0;
                                tasks.forEach(task => {
                                    const score = parseFloat(row.scores[task.id]) || 0;
                                    weightedSum += score * task.weight;
                                    totalWeight += task.weight;
                                });
                                const average = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '-';
                                const hasGrades = visibleTasks.some(t => row.scores[t.id] !== null && row.scores[t.id] !== undefined && row.scores[t.id] !== '');

                                return (
                                    <ListItem
                                        key={row.enrollment_id}
                                        button
                                        onClick={() => {
                                            setMobileSelectedRow(row);
                                            setMobileModalOpen(true);
                                        }}
                                        style={{
                                            borderBottom: '1px solid',
                                            borderColor: theme.palette.divider,
                                            padding: '12px 16px',
                                            backgroundColor: index % 2 === 0 ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <div>
                                                <Typography variant="body1" style={{ fontWeight: 600 }}>
                                                    {row.paterno} {row.materno} {row.nombre}
                                                </Typography>
                                                {tasks.length > 0 && (
                                                    <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>
                                                        Promedio: {average}
                                                    </Typography>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {visibleTasks.slice(0, 3).map(task => {
                                                    const letter = getLetterFromScore(row.scores[task.id]);
                                                    return letter ? (
                                                        <span
                                                            key={task.id}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '50%',
                                                                backgroundColor: theme.palette.primary.main,
                                                                color: '#fff',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            {letter}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            key={task.id}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '50%',
                                                                border: `2px dashed ${theme.palette.divider}`,
                                                                color: theme.palette.text.disabled,
                                                                fontSize: '0.7rem',
                                                            }}
                                                        >
                                                            —
                                                        </span>
                                                    );
                                                })}
                                                {visibleTasks.length > 3 && (
                                                    <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>+{visibleTasks.length - 3}</Typography>
                                                )}
                                                <IconPencil size="1rem" color={theme.palette.text.secondary} />
                                            </div>
                                        </div>
                                    </ListItem>
                                );
                            })
                        )}
                    </List>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Estudiante</TableCell>
                                    {visibleTasks.map(task => (
                                        <TableCell key={task.id} align="center">
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Tooltip title={`Peso: ${task.weight}x`}>
                                                    <span>
                                                        {task.name}
                                                        {task.is_locked && <IconLock size="0.8rem" color="red" style={{ marginLeft: 4 }} />}
                                                    </span>
                                                </Tooltip>
                                                <IconButton size="small" onClick={(e) => handleBulkMenuOpen(e, task.id)} disabled={task.is_locked}>
                                                    <IconSettings size="1rem" />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" style={{ fontWeight: 'bold' }}>Promedio Final</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={visibleTasks.length + 2} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.length === 0 ? (
                                    <TableRow><TableCell colSpan={visibleTasks.length + 2} align="center">No hay estudiantes o tareas.</TableCell></TableRow>
                                ) : (
                                    filteredRows.map(row => {
                                        // Calculate row average
                                        let totalWeight = 0;
                                        let weightedSum = 0;
                                        tasks.forEach(task => { // Average includes ALL tasks or only visible? Usually all, but effectively visible ones for grading. 
                                            // If a task is hidden, should it count? 
                                            // Standard logic: It counts towards the grade if it exists. Hiding is usually just visual.
                                            // Keeping 'tasks' here ensures calculation remains correct even if hidden.
                                            const score = parseFloat(row.scores[task.id]) || 0;
                                            weightedSum += score * task.weight;
                                            totalWeight += task.weight;
                                        });
                                        const average = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '-';

                                        return (
                                            <TableRow key={row.enrollment_id} hover>
                                                <TableCell>{row.paterno} {row.materno} {row.nombre}</TableCell>
                                                {visibleTasks.map(task => {
                                                    const score = row.scores[task.id];
                                                    const letter = getLetterFromScore(score);

                                                    return (
                                                        <TableCell key={task.id} align="center" style={{ minWidth: isMobile ? 120 : 180, padding: isMobile ? 4 : 16 }}>
                                                            {letter && !editMode[`${row.enrollment_id}-${task.id}`] ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginRight: 8 }}>{letter}</span>
                                                                    {task.is_locked ? (
                                                                        <IconLock size="1rem" color="gray" />
                                                                    ) : (
                                                                        <IconButton size="small" onClick={() => toggleEditMode(row.enrollment_id, task.id)}>
                                                                            <IconPencil size="1rem" />
                                                                        </IconButton>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <Grid container spacing={1} justifyContent="center" style={{ width: '100%', margin: 0 }}>
                                                                    {Object.keys(LETTER_SCORES).map(l => (
                                                                        <Grid item key={l} style={{ padding: 2 }}>
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                style={{
                                                                                    minWidth: isMobile ? 25 : 30,
                                                                                    padding: isMobile ? '2px' : '4px',
                                                                                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                                                                                    borderColor: theme.palette.primary.main,
                                                                                    color: letter === l ? '#fff' : theme.palette.primary.main,
                                                                                    backgroundColor: letter === l ? theme.palette.primary.main : 'transparent'
                                                                                }}
                                                                                color="primary"
                                                                                onClick={() => handleGradeClick(row.enrollment_id, task.id, l)}
                                                                                disabled={task.is_locked}
                                                                            >
                                                                                {l}
                                                                            </Button>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                                                    {average}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            )}

            {/* Bulk Actions Menu */}
            <Menu
                id="bulk-menu"
                anchorEl={bulkMenuAnchor}
                keepMounted
                open={Boolean(bulkMenuAnchor)}
                onClose={handleBulkMenuClose}
            >
                <MenuItem disabled>Calificar Todos:</MenuItem>
                {Object.keys(LETTER_SCORES).map(l => (
                    <MenuItem key={l} onClick={() => handleBulkGrade(l)}>
                        Asignar {l}
                    </MenuItem>
                ))}
            </Menu>

            {/* Mobile Grading Modal */}
            <Dialog
                open={mobileModalOpen}
                onClose={() => {
                    setMobileModalOpen(false);
                    setMobileSelectedRow(null);
                }}
                fullWidth
                maxWidth="xs"
            >
                {mobileSelectedRow && (
                    <>
                        <DialogTitle style={{ paddingBottom: 8 }}>
                            <Typography variant="subtitle1" style={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                                {mobileSelectedRow.paterno} {mobileSelectedRow.materno} {mobileSelectedRow.nombre}
                            </Typography>
                        </DialogTitle>
                        <DialogContent style={{ paddingTop: 0 }}>
                            {visibleTasks.length === 0 ? (
                                <Typography variant="body2" color="textSecondary">No hay tareas visibles.</Typography>
                            ) : (
                                visibleTasks.map(task => {
                                    // Use live data from rows (mobileSelectedRow may be stale after grading)
                                    const liveRow = rows.find(r => r.enrollment_id === mobileSelectedRow.enrollment_id) || mobileSelectedRow;
                                    const score = liveRow.scores[task.id];
                                    const letter = getLetterFromScore(score);
                                    return (
                                        <div key={task.id} style={{ marginBottom: 20 }}>
                                            <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                                                {task.name}
                                                {task.is_locked && <IconLock size="0.9rem" color="red" style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                                            </Typography>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {Object.keys(LETTER_SCORES).map(l => (
                                                    <Button
                                                        key={l}
                                                        variant={letter === l ? 'contained' : 'outlined'}
                                                        color="primary"
                                                        size="medium"
                                                        disabled={task.is_locked}
                                                        style={{
                                                            minWidth: 48,
                                                            height: 48,
                                                            fontSize: '1rem',
                                                            fontWeight: 'bold',
                                                        }}
                                                        onClick={() => {
                                                            handleGradeClick(liveRow.enrollment_id, task.id, l);
                                                            // Update modal's reference row to reflect new score
                                                            setMobileSelectedRow(prev => ({
                                                                ...prev,
                                                                scores: { ...prev.scores, [task.id]: LETTER_SCORES[l] }
                                                            }));
                                                        }}
                                                    >
                                                        {l}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setMobileModalOpen(false);
                                    setMobileSelectedRow(null);
                                }}
                                color="primary"
                                variant="contained"
                                fullWidth
                                style={{ margin: '0 16px 8px' }}
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Floating Action Button and Menu */}
            <Fab
                color="secondary"
                aria-label="actions"
                onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
            >
                <IconSettings />
            </Fab>

            <Menu
                anchorEl={actionsMenuAnchor}
                keepMounted
                open={Boolean(actionsMenuAnchor)}
                onClose={() => setActionsMenuAnchor(null)}
            >
                <MenuItem
                    onClick={() => {
                        setActionsMenuAnchor(null);
                        setConfirmOpen(true);
                    }}
                    disabled={!selectedSubCrit}
                >
                    <IconPlus style={{ marginRight: 8 }} size="1.2rem" />
                    Crear Tarea
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setActionsMenuAnchor(null);
                        setDeleteDialogOpen(true);
                    }}
                    disabled={!selectedSubCrit || tasks.length === 0}
                >
                    <IconSettings style={{ marginRight: 8 }} size="1.2rem" />
                    Gestionar Tareas
                </MenuItem>
            </Menu>

            <TaskDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleAddTask}
            />

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>¿Crear Nueva Tarea?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Al crear una tarea para este sub-criterio, la calificación manual directa se bloqueará y se calculará automáticamente en base a las tareas.
                        <br />
                        ¿Está seguro de continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={() => {
                        setConfirmOpen(false);
                        setDialogOpen(true);
                    }} color="primary" autoFocus>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Tasks Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Gestionar Tareas</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ marginBottom: 20 }}>
                        Edite o elimine las tareas. Los cambios recalcularán automáticamente las notas.
                    </DialogContentText>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre de la Tarea</TableCell>
                                    <TableCell align="center" style={{ width: 80 }}>Peso</TableCell>
                                    <TableCell align="center" style={{ width: 80 }}>Visible</TableCell>
                                    <TableCell align="center" style={{ width: 80 }}>Bloq.</TableCell>
                                    <TableCell align="center" style={{ width: 120 }}>Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            {editingTaskId === task.id ? (
                                                <TextField
                                                    fullWidth
                                                    value={editTaskData.name}
                                                    onChange={(e) => setEditTaskData({ ...editTaskData, name: e.target.value })}
                                                    size="small"
                                                />
                                            ) : task.name}
                                        </TableCell>
                                        <TableCell align="center">
                                            {editingTaskId === task.id ? (
                                                <TextField
                                                    type="number"
                                                    value={editTaskData.weight}
                                                    onChange={(e) => setEditTaskData({ ...editTaskData, weight: parseInt(e.target.value) || 1 })}
                                                    size="small"
                                                    inputProps={{ min: 1 }}
                                                />
                                            ) : `${task.weight}x`}
                                        </TableCell>
                                        <TableCell align="center">
                                            {editingTaskId === task.id ? (
                                                // Disabled in edit mode or kept static
                                                task.is_public ? <IconEye size="1.2rem" color="grey" /> : <IconEyeOff size="1.2rem" color="grey" />
                                            ) : (
                                                <IconButton onClick={() => handleToggleTaskField(task, 'is_public')} size="small">
                                                    {task.is_public ? <IconEye size="1.2rem" color="green" /> : <IconEyeOff size="1.2rem" color="gray" />}
                                                </IconButton>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {editingTaskId === task.id ? (
                                                // Disabled in edit mode
                                                task.is_locked ? <IconLock size="1.2rem" color="grey" /> : <IconLockOpen size="1.2rem" color="grey" />
                                            ) : (
                                                <IconButton onClick={() => handleToggleTaskField(task, 'is_locked')} size="small">
                                                    {task.is_locked ? <IconLock size="1.2rem" color="red" /> : <IconLockOpen size="1.2rem" color="green" />}
                                                </IconButton>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {editingTaskId === task.id ? (
                                                <>
                                                    <IconButton onClick={handleUpdateTask} color="primary" size="small">
                                                        <IconDeviceFloppy />
                                                    </IconButton>
                                                    <IconButton onClick={cancelEditingTask} size="small">
                                                        <IconTrash style={{ transform: 'rotate(45deg)' }} />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <IconButton onClick={() => startEditingTask(task)} color="primary" size="small">
                                                        <IconPencil />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDeleteTask(task.id)} color="secondary" size="small">
                                                        <IconTrash />
                                                    </IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>




            <TaskDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleAddTask}
            />

            <Dialog
                open={openUndoDialog}
                onClose={() => setOpenUndoDialog(false)}
            >
                <DialogTitle>Deshacer Cambios</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro de deshacer los cambios no guardados? Se revertirán a los valores originales.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUndoDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmUndo} color="error" autoFocus>
                        Deshacer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6} variant="filled">
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </MainCard >
    );
};

export default TaskGrading;
