import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid
} from '@material-ui/core';

const TaskDialog = ({ open, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [weight, setWeight] = useState(1);

    const handleSave = () => {
        if (!name) return;
        onSave({ name, weight: parseInt(weight) });
        setName('');
        setWeight(1);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} style={{ marginTop: 5 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nombre de la Tarea"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Ponderación (Equivale a N tareas)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            variant="outlined"
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancelar</Button>
                <Button onClick={handleSave} color="secondary" variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskDialog;
