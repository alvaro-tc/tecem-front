
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, IconButton, Grid, Divider, Box } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { formatSchedule, getScheduleItems } from '../../../utils/scheduleUtils';

const InfoModal = ({ open, onClose, course }) => {
    if (!course) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h3">Información de la Materia</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4" color="primary">{course.name}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">({course.code})</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Paralelo:</Typography>
                        <Typography variant="body1">{course.parallel || "No asignado"}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Horario:</Typography>
                        <Typography variant="body1">
                            {getScheduleItems(course.schedule).length > 0 ? (
                                getScheduleItems(course.schedule).map((item, idx) => (
                                    <div key={idx}>{item}</div>
                                ))
                            ) : "Sin horario definido"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2">Docente:</Typography>
                        <Typography variant="body1">{course.teacher}</Typography>
                    </Grid>

                    {course.whatsapp_link && (
                        <Grid item xs={12}>
                            <Box mt={2} display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<WhatsAppIcon />}
                                    href={course.whatsapp_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Unirse al Grupo de WhatsApp
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default InfoModal;
