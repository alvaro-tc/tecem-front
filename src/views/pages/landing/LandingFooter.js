import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, IconButton, Stack } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { IconBrandFacebook, IconBrandYoutube, IconBrandTiktok, IconBrandInstagram } from '@tabler/icons';
import axios from 'axios';
import configData from '../../../config';

const LandingFooter = () => {
    const theme = useTheme();
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        youtube: '',
        tiktok: '',
        instagram: ''
    });

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const response = await axios.get(`${configData.API_SERVER}web-config/`);
                if (response.data) {
                    setSocialLinks(response.data);
                }
            } catch (error) {
                console.error('Error fetching social links:', error);
            }
        };

        fetchSocialLinks();
    }, []);

    const socialIconStyle = {
        color: '#fff',
        '&:hover': {
            background: 'rgba(255,255,255,0.1)',
            transform: 'translateY(-2px)'
        },
        transition: 'all 0.2s ease'
    };

    return (
        <Box sx={{ background: theme.palette.grey[900], color: '#fff', py: 6 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h3" sx={{ color: '#fff', mb: 2 }}>Plataforma EMERGENTES</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Facilitando la educación y administración académica.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            {socialLinks.facebook && (
                                <IconButton component="a" href={socialLinks.facebook} target="_blank" sx={socialIconStyle}>
                                    <IconBrandFacebook />
                                </IconButton>
                            )}
                            {socialLinks.youtube && (
                                <IconButton component="a" href={socialLinks.youtube} target="_blank" sx={socialIconStyle}>
                                    <IconBrandYoutube />
                                </IconButton>
                            )}
                            {socialLinks.tiktok && (
                                <IconButton component="a" href={socialLinks.tiktok} target="_blank" sx={socialIconStyle}>
                                    <IconBrandTiktok />
                                </IconButton>
                            )}
                            {socialLinks.instagram && (
                                <IconButton component="a" href={socialLinks.instagram} target="_blank" sx={socialIconStyle}>
                                    <IconBrandInstagram />
                                </IconButton>
                            )}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>
                            © 2026 Plataforma Emergentes. Todos los derechos reservados.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingFooter;
