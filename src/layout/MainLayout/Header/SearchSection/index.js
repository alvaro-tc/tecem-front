import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Avatar, Box, ButtonBase, Card, CardContent, Grid, InputAdornment, OutlinedInput, Popper, List, ListItem, ListItemText, Paper, ClickAwayListener, Menu, MenuItem, FormControlLabel, Checkbox, Select, InputLabel, FormControl } from '@material-ui/core';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import Transitions from '../../../../ui-component/extended/Transitions';
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons';
import axios from 'axios';
import configData from '../../../../config';
import { SET_ACTIVE_COURSE } from '../../../../store/actions';

const useStyles = makeStyles((theme) => ({
    searchControl: {
        width: '434px',
        marginLeft: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
        '& input': {
            background: 'transparent !important',
            paddingLeft: '5px !important'
        },
        [theme.breakpoints.down('lg')]: {
            width: '250px'
        },
        [theme.breakpoints.down('md')]: {
            width: '100%',
            marginLeft: '4px',
            background: '#fff'
        }
    },
    startAdornment: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    closeAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.orange.light,
        color: theme.palette.orange.dark,
        '&:hover': {
            background: theme.palette.orange.dark,
            color: theme.palette.orange.light
        }
    },
    popperContainer: {
        zIndex: 1100,
        width: '99%',
        top: '-55px !important',
        padding: '0 12px',
        [theme.breakpoints.down('sm')]: {
            padding: '0 10px'
        }
    },
    cardContent: {
        padding: '12px !important'
    },
    card: {
        background: '#fff',
        [theme.breakpoints.down('sm')]: {
            border: 0,
            boxShadow: 'none'
        }
    }
}));

const SearchSection = () => {
    const classes = useStyles();
    const [value, setValue] = useState('');
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [open, setOpen] = useState(false);

    // Logic: Desktop input handling
    const anchorRef = useRef(null);

    const dispatch = useDispatch();
    const account = useSelector((state) => state.account);
    const activeCourse = useSelector((state) => state.account.activeCourse);

    const fetchCourses = () => {
        if (account.token) {
            axios.defaults.headers.common['Authorization'] = `Token ${account.token}`;
            axios.get(configData.API_SERVER + 'courses')
                .then(response => {
                    setCourses(response.data);
                    if (response.data.length > 0 && (!activeCourse || (account.user && account.user.active_course && activeCourse.id !== account.user.active_course))) {
                        let selected = null;
                        // 1. Try to load from user profile
                        if (account.user && account.user.active_course) {
                            selected = response.data.find(c => c.id === account.user.active_course);
                        }

                        // 2. Fallback to first non-archived
                        if (!selected) {
                            selected = response.data.find(c => !c.subject_details?.archived) || response.data[0];
                        }

                        if (selected) {
                            dispatch({ type: SET_ACTIVE_COURSE, payload: selected });
                            setValue(`${selected.subject_details?.name} - ${selected.parallel}`);
                        }
                    }
                })
                .catch(error => console.error("Error fetching courses", error));
        }
    };

    useEffect(() => {
        fetchCourses();
        if (account.user) {
            console.log("SearchSection: User loaded", account.user);
            console.log("SearchSection: Active Course in User", account.user.active_course);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account.token, account.user]);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
        if (!open) {
            fetchCourses(); // Refresh on open
        }
    };

    const [showArchived, setShowArchived] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('All');
    const [selectedProgram, setSelectedProgram] = useState('All');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSettingsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setAnchorEl(null);
    };

    const handleToggleArchived = () => {
        setShowArchived(!showArchived);
    };

    // Extract unique periods and programs from courses' subjects
    const periods = ['All', ...new Set(courses.map(course => course.subject_details?.period_details ? course.subject_details.period_details.name : 'Unknown'))];
    const programs = ['All', ...new Set(courses.map(course => course.subject_details?.program_details ? course.subject_details.program_details.name : 'Unknown'))];

    const filteredCoursesList = courses.filter(course => {
        const subjectName = course.subject_details?.name || '';
        const courseParallel = course.parallel || '';
        const lowerValue = value.toLowerCase();

        const matchesSearch = subjectName.toLowerCase().includes(lowerValue) || courseParallel.toLowerCase().includes(lowerValue);

        const coursePeriod = course.subject_details?.period_details ? course.subject_details.period_details.name : 'Unknown';
        const matchesPeriod = selectedPeriod === 'All' || coursePeriod === selectedPeriod;

        const courseProgram = course.subject_details?.program_details ? course.subject_details.program_details.name : 'Unknown';
        const matchesProgram = selectedProgram === 'All' || courseProgram === selectedProgram;

        // Logic: specific period selection overrides archived status, otherwise respect showArchived toggle
        const isPeriodSelected = selectedPeriod !== 'All';
        const isArchived = course.subject_details?.archived;

        const matchesArchived = showArchived || !isArchived || isPeriodSelected;

        return matchesSearch && matchesArchived && matchesPeriod && matchesProgram;
    });

    useEffect(() => {
        setFilteredCourses(filteredCoursesList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, courses, showArchived, selectedPeriod, selectedProgram]);

    const handleSearch = (event) => {
        const query = event.target.value;
        setValue(query);
        setOpen(true);
    };

    const handleSelect = (course) => {
        setOpen(false);
        setValue(`${course.subject_details?.name} - ${course.parallel}`);
        dispatch({ type: SET_ACTIVE_COURSE, payload: course });

        // Persist selection
        if (account.token) {
            axios.patch(configData.API_SERVER + 'manage-users/profile/', { active_course: course.id })
                .catch(error => console.error("Error saving active course preference", error));
        }
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <React.Fragment>
            {/* Mobile View omitted for brevity, focusing on Desktop logic below */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <PopupState variant="popper" popupId="demo-popup-popper">
                    {(popupState) => (
                        <React.Fragment>
                            <Box sx={{ ml: 2 }}>
                                <ButtonBase sx={{ borderRadius: '12px' }}>
                                    <Avatar variant="rounded" className={classes.headerAvatar} {...bindToggle(popupState)}>
                                        <IconSearch stroke={1.5} size="1.2rem" />
                                    </Avatar>
                                </ButtonBase>
                            </Box>
                            <Popper {...bindPopper(popupState)} transition className={classes.popperContainer}>
                                {({ TransitionProps }) => (
                                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                        <Card className={classes.card}>
                                            <CardContent className={classes.cardContent}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs>
                                                        <OutlinedInput
                                                            className={classes.searchControl}
                                                            id="input-search-header"
                                                            value={value}
                                                            onChange={handleSearch}
                                                            placeholder="Buscar Paralelo"
                                                            startAdornment={
                                                                <InputAdornment position="start">
                                                                    <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                                                                </InputAdornment>
                                                            }
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                        <Avatar variant="rounded" className={classes.headerAvatar}>
                                                                            <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                                                        </Avatar>
                                                                    </ButtonBase>
                                                                    <Box sx={{ ml: 2 }}>
                                                                        <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                            <Avatar variant="rounded" className={classes.closeAvatar} {...bindToggle(popupState)}>
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </Avatar>
                                                                        </ButtonBase>
                                                                    </Box>
                                                                </InputAdornment>
                                                            }
                                                            aria-describedby="search-helper-text"
                                                            inputProps={{ 'aria-label': 'weight' }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Transitions>
                                )}
                            </Popper>
                        </React.Fragment>
                    )}
                </PopupState>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <OutlinedInput
                    className={classes.searchControl}
                    id="input-search-header"
                    value={value}
                    onClick={handleToggle} // Refresh list on click
                    onChange={(e) => {
                        setValue(e.target.value);
                        setOpen(true);
                    }}
                    placeholder="Buscar Paralelo"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <ButtonBase sx={{ borderRadius: '12px' }} onClick={handleSettingsClick}>
                                <Avatar variant="rounded" className={classes.headerAvatar}>
                                    <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                </Avatar>
                            </ButtonBase>
                            {/* ... Menu omitted for brevity ... */}
                            <Menu
                                id="search-settings-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleSettingsClose}
                            >
                                <MenuItem>
                                    <FormControl fullWidth>
                                        <InputLabel id="period-select-label">Periodo</InputLabel>
                                        <Select
                                            labelId="period-select-label"
                                            id="period-select"
                                            value={selectedPeriod}
                                            label="Periodo"
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                        >
                                            {periods.map((period) => (
                                                <MenuItem key={period} value={period}>{period}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </MenuItem>
                                <MenuItem>
                                    <FormControl fullWidth>
                                        <InputLabel id="program-select-label">Carrera</InputLabel>
                                        <Select
                                            labelId="program-select-label"
                                            id="program-select"
                                            value={selectedProgram}
                                            label="Carrera"
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                        >
                                            {programs.map((program) => (
                                                <MenuItem key={program} value={program}>{program}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </MenuItem>
                                <MenuItem onClick={handleToggleArchived}>
                                    <FormControlLabel
                                        control={<Checkbox checked={showArchived} onChange={handleToggleArchived} name="showArchived" color="primary" />}
                                        label="Mostrar Archivados"
                                    />
                                </MenuItem>
                            </Menu>
                        </InputAdornment>
                    }
                    aria-describedby="search-helper-text"
                    inputProps={{ 'aria-label': 'weight' }}
                    ref={anchorRef}
                />
                <Popper
                    open={open && filteredCourses.length > 0}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                    style={{ zIndex: 1200, width: '434px' }}
                    placement="bottom-start"
                >
                    {({ TransitionProps, placement }) => (
                        <Transitions type="fade" {...TransitionProps}>
                            <Paper sx={{ maxHeight: 250, overflow: 'auto', mt: 1 }}>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <List>
                                        {value === '' && (
                                            <ListItem style={{ backgroundColor: '#f5f5f5' }}>
                                                <ListItemText primary="Sugerencias" primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }} />
                                            </ListItem>
                                        )}
                                        {filteredCourses.slice(0, value === '' ? 3 : undefined).map((course) => (
                                            <ListItem button key={course.id} onClick={() => handleSelect(course)}>
                                                <ListItemText
                                                    primary={`${course.subject_details?.name} - ${course.parallel}`}
                                                    secondary={`${course.subject_details?.period_details ? course.subject_details.period_details.name : ''} - ${course.subject_details?.program_details ? course.subject_details.program_details.name : ''}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </ClickAwayListener>
                            </Paper>
                        </Transitions>
                    )}
                </Popper>
            </Box>
        </React.Fragment>
    );
};

export default SearchSection;
