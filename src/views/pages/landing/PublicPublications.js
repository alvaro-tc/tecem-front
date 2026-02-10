import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Chip
} from '@material-ui/core';
import { IconBook } from '@tabler/icons';
import axios from 'axios';
import configData from '../../../config';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const PublicPublications = () => {
    const theme = useTheme();
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublications();
    }, []);

    const fetchPublications = async () => {
        try {
            const response = await axios.get(`${configData.API_SERVER}publications/`);
            setPublications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching publications:', error);
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Unified Section with Background */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.background.default} 100%)`,
                    pt: 0,
                    pb: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '100vh'
                }}
            >
                <LandingHeader />
                <Box sx={{ pt: 12 }} />

                {/* Decorative shapes */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: theme.palette.primary.light, opacity: 0.2, zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: theme.palette.secondary.main, opacity: 0.15, zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, color: theme.palette.grey[900], mb: 2 }}>
                            Publicaciones
                        </Typography>
                        <Typography variant="h5" color="textSecondary" sx={{ fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
                            Explora nuestra colección de libros y documentos académicos
                        </Typography>
                    </Box>

                    {/* Publications Grid */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                            <CircularProgress size={60} />
                        </Box>
                    ) : publications.length > 0 ? (
                        <Grid container spacing={4}>
                            {publications.map((publication) => (
                                <Grid item xs={12} sm={6} md={4} key={publication.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            transition: 'all 0.3s ease',
                                            border: `2px solid ${theme.palette.divider}`,
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: theme.shadows[12],
                                                borderColor: theme.palette.primary.main
                                            }
                                        }}
                                    >
                                        {publication.image_url ? (
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                image={publication.image_url}
                                                alt={publication.title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 300,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: theme.palette.grey[200]
                                                }}
                                            >
                                                <IconBook size={80} color={theme.palette.grey[400]} />
                                            </Box>
                                        )}
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                                {publication.title}
                                            </Typography>
                                            <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                                {publication.author}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                                                {publication.summary.length > 150
                                                    ? `${publication.summary.substring(0, 150)}...`
                                                    : publication.summary}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                                                <Chip
                                                    label={`${publication.pages} páginas`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    label={`${publication.stock} disponibles`}
                                                    size="small"
                                                    color={publication.stock > 0 ? 'secondary' : 'default'}
                                                />
                                                {publication.dl && (
                                                    <Chip
                                                        label={`DL: ${publication.dl}`}
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Typography variant="h1" sx={{ fontSize: '5rem', mb: 2, opacity: 0.3 }}>📚</Typography>
                            <Typography variant="h4" color="textSecondary" gutterBottom>
                                No se encontraron publicaciones
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Aún no hay publicaciones disponibles
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Footer */}
            <LandingFooter />
        </Box>
    );
};

export default PublicPublications;
