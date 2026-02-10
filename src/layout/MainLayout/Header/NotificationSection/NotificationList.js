import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from '@material-ui/styles';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
    Box
} from '@material-ui/core';
import { IconBell, IconChecks, IconInfoCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const useStyles = (theme) => ({
    listAction: {
        top: '22px'
    },
    actionColor: {
        color: theme.palette.grey[500]
    },
    listItem: {
        padding: 0
    },
    listDivider: {
        marginTop: 0,
        marginBottom: 0
    },
    listChipError: {
        color: theme.palette.orange.dark,
        backgroundColor: theme.palette.orange.light,
        height: '24px',
        padding: '0 6px',
        marginRight: '5px'
    },
    listChipWarning: {
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.warning.light,
        height: '24px',
        padding: '0 6px'
    },
    listChipSuccess: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.success.light,
        height: '24px',
        padding: '0 6px'
    },
    listAvatarSuccess: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.success.light,
        border: 'none',
        borderColor: theme.palette.success.main
    },
    listAvatarPrimary: {
        color: theme.palette.primary.dark,
        backgroundColor: theme.palette.primary.light,
        border: 'none',
        borderColor: theme.palette.primary.main
    },
    listAvatarWarning: {
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.warning.light,
        border: 'none',
        borderColor: theme.palette.warning.main
    },
    listAvatarError: {
        color: theme.palette.error.dark,
        backgroundColor: theme.palette.error.light,
        border: 'none',
        borderColor: theme.palette.error.main
    },
    listContainer: {
        paddingLeft: '56px'
    },
    paddingBottom: {
        paddingBottom: '16px'
    },
    itemAction: {
        cursor: 'pointer',
        padding: '16px',
        '&:hover': {
            background: theme.palette.primary.light
        }
    }
});

const NotificationList = ({ notifications = [] }) => {
    const theme = useTheme();
    const classes = useStyles(theme);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <IconCircleCheck stroke={1.5} size="1.3rem" />;
            case 'warning':
                return <IconAlertTriangle stroke={1.5} size="1.3rem" />;
            case 'error':
                return <IconAlertTriangle stroke={1.5} size="1.3rem" />;
            case 'info':
            default:
                return <IconInfoCircle stroke={1.5} size="1.3rem" />;
        }
    };

    const getAvatarClass = (type) => {
        switch (type) {
            case 'success':
                return classes.listAvatarSuccess;
            case 'warning':
                return classes.listAvatarWarning;
            case 'error':
                return classes.listAvatarError;
            case 'info':
            default:
                return classes.listAvatarPrimary;
        }
    };

    if (!notifications || notifications.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <IconBell size="2rem" style={{ opacity: 0.3, marginBottom: 8 }} />
                <Typography variant="body2" color="textSecondary">
                    No tienes notificaciones
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%', maxWidth: 330, py: 0, borderRadius: '10px', [theme.breakpoints.down('sm')]: { maxWidth: 300 } }}>
            {notifications.map((notification, index) => (
                <div key={notification.id}>
                    <div style={classes.itemAction}>
                        <ListItem alignItems="center" style={classes.listItem} component={notification.link ? Link : 'div'} to={notification.link}>
                            <ListItemAvatar>
                                <Avatar style={getAvatarClass(notification.type)}>
                                    {getIcon(notification.type)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={<Typography variant="subtitle1">{notification.title}</Typography>} />
                            <ListItemSecondaryAction style={classes.listAction}>
                                <Grid container justifyContent="flex-end">
                                    <Grid item xs={12}>
                                        <Typography variant="caption" display="block" gutterBottom style={classes.actionColor}>
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Grid container direction="column" style={classes.listContainer}>
                            <Grid item xs={12} style={classes.paddingBottom}>
                                <Typography variant="subtitle2">{notification.message}</Typography>
                            </Grid>
                            {!notification.is_read && (
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item>
                                            <Chip label="Nueva" style={classes.listChipWarning} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </div>
                    {index < notifications.length - 1 && <Divider style={classes.listDivider} />}
                </div>
            ))}
        </List>
    );
};

NotificationList.propTypes = {
    notifications: PropTypes.array
};

export default NotificationList;
