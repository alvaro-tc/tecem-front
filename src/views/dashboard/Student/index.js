import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Typography, Card, CardContent, CardMedia, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';
import configData from '../../../config';
import MainCard from '../../../ui-component/cards/MainCard';
import { gridSpacing } from '../../../store/constant';
import { Link } from 'react-router-dom';

import InfoModal from './InfoModal';
import GradesModal from './GradesModal';
import * as ScheduleUtils from '../../../utils/scheduleUtils';

const useStyles = makeStyles((theme) => ({
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        height: 140,
    },
    cardContent: {
        flexGrow: 1,
    },
    courseTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: theme.spacing(1),
    },
    courseInfo: {
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(0.5),
    },
}));

const StudentDashboard = () => {
    const classes = useStyles();
    const [isLoading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const account = useSelector((state) => state.account);

    const [infoOpen, setInfoOpen] = useState(false);
    const [gradesOpen, setGradesOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = account.token;
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${configData.API_SERVER}reports/dashboard_stats/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching student dashboard stats:", error);
                setLoading(false);
            }
        };

        if (account.isInitialized) {
            fetchStats();
        }
    }, [account]);

    const handleInfoClick = (course) => {
        setSelectedCourse(course);
        setInfoOpen(true);
    };

    const handleGradesClick = (course) => {
        setSelectedCourse(course);
        setGradesOpen(true);
    };

    const handleClose = () => {
        setInfoOpen(false);
        setGradesOpen(false);
        setSelectedCourse(null);
    };

    if (isLoading) {
        return <Typography>Cargando cursos...</Typography>;
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Typography variant="h2" gutterBottom>Mis Cursos Inscritos</Typography>
            </Grid>
            {stats.enrolled_courses && stats.enrolled_courses.length > 0 ? (
                stats.enrolled_courses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                        <MainCard content={false} className={classes.card}>
                            <CardMedia
                                className={classes.cardMedia}
                                image={course.image || 'https://via.placeholder.com/300x140?text=No+Image'}
                                title={course.name}
                            />
                            <Box className={classes.cardContent} p={2}>
                                <Typography className={classes.courseTitle} variant="h4" component="h2">
                                    {course.name}
                                </Typography>
                                <Typography className={classes.courseInfo}>
                                    {course.code} - {course.parallel || 'Sin Paralelo'}
                                </Typography>
                                <Typography className={classes.courseInfo}>
                                    Docente: {course.teacher}
                                </Typography>
                                <Typography className={classes.courseInfo}>
                                    Periodo: {course.period}
                                </Typography>
                                <Typography className={classes.courseInfo} component="div">
                                    <strong>Horario:</strong>
                                    {ScheduleUtils.getScheduleItems(course.schedule).length > 0 ? (
                                        ScheduleUtils.getScheduleItems(course.schedule).map((item, idx) => (
                                            <div key={idx}>{item}</div>
                                        ))
                                    ) : <span style={{ marginLeft: 4 }}>Por definir</span>}
                                </Typography>
                            </Box>
                            <Box p={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => handleInfoClick(course)}
                                        >
                                            Info
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button
                                            size="small"
                                            color="secondary"
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleGradesClick(course)}
                                        >
                                            Ver Notas
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </MainCard>
                    </Grid>
                ))
            ) : (
                <Grid item xs={12}>
                    <MainCard>
                        <Typography align="center" variant="h4">No estás inscrito en ningún curso actualmente.</Typography>
                    </MainCard>
                </Grid>
            )}

            {/* Modals */}
            <InfoModal open={infoOpen} onClose={handleClose} course={selectedCourse} />
            <GradesModal open={gradesOpen} onClose={handleClose} course={selectedCourse} />
        </Grid>
    );
};

export default StudentDashboard;
