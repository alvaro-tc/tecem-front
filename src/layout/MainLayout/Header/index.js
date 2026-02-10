import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { Avatar, Box, ButtonBase, Typography } from '@material-ui/core';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';

// assets
import { IconMenu2 } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    boxContainer: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: 'auto'
        }
    }
}));

//-----------------------|| MAIN NAVBAR / HEADER ||-----------------------//

const Header = ({ handleLeftDrawerToggle }) => {
    const classes = useStyles();
    const activeCourse = useSelector((state) => state.account.activeCourse);

    return (
        <React.Fragment>
            {/* logo & toggler button */}
            <div className={classes.boxContainer}>
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                    <LogoSection />
                </Box>
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar variant="rounded" className={classes.headerAvatar} onClick={handleLeftDrawerToggle} color="inherit">
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
            </div>

            {/* header search */}
            <SearchSection theme="light" />

            {activeCourse && (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2 }}>
                    <Box sx={{
                        p: 1.25,
                        px: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: theme => theme.palette.primary.light,
                        bgcolor: theme => theme.palette.primary.light,
                        mr: 1
                    }}>
                        <Typography variant="subtitle1" color="primary.dark">
                            {activeCourse.subject_details ? activeCourse.subject_details.name : 'Unknown Subject'} {activeCourse.parallel ? `- ${activeCourse.parallel}` : ''}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1.25,
                        px: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: theme => theme.palette.secondary.light,
                        bgcolor: theme => theme.palette.secondary.light,
                        mr: 1
                    }}>
                        <Typography variant="subtitle1" color="secondary.dark">
                            {activeCourse.subject_details?.period_details ? activeCourse.subject_details.period_details.name : 'No Period'}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1.25,
                        px: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: theme => theme.palette.orange.light,
                        bgcolor: theme => theme.palette.orange.light
                    }}>
                        <Typography variant="subtitle1" color="orange.dark">
                            {activeCourse.subject_details?.program_details ? activeCourse.subject_details.program_details.name : 'No Program'}
                        </Typography>
                    </Box>
                </Box>
            )}

            <div className={classes.grow} />
            <div className={classes.grow} />

            <ProfileSection />
        </React.Fragment>
    );
};

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
};

export default Header;
