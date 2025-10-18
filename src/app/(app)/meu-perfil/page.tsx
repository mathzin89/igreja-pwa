// src/app/app/meu-perfil/page.tsx (Seu arquivo existente ou recém-criado)
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // ✅ AJUSTE ESTE CAMINHO
import { updateUserProfile } from '@/app/actions/updateUserProfile'; // ✅ AJUSTE ESTE CAMINHO
import {
  Box, Typography, CircularProgress, Alert, Button, TextField, Paper, Avatar, IconButton, Chip, Stack
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Link from 'next/link';

export default function MeuPerfilPage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para os campos do formulário
  const [formNome, setFormNome] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formDataNascimento, setFormDataNascimento] = useState('');
  const [formDataMembroDesde, setFormDataMembroDesde] = useState('');
  const [formMinistries, setFormMinistries] = useState<string[]>([]);
  const [ministryInput, setMinistryInput] = useState('');

  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormNome(userProfile.nome || '');
      setFormBio(userProfile.bio || '');
      setFormDataNascimento(userProfile.dataNascimento || '');
      setFormDataMembroDesde(userProfile.dataMembroDesde || '');
      setFormMinistries(userProfile.ministries || []);
      setFormPhotoPreview(userProfile.foto || null); // ✅ Usando 'foto'
    }
  }, [userProfile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFormPhotoPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setFormPhotoPreview(userProfile?.foto || null);
    }
  };

  const handleAddMinistry = () => {
    if (ministryInput.trim() !== '' && !formMinistries.includes(ministryInput.trim())) {
      setFormMinistries([...formMinistries, ministryInput.trim()]);
      setMinistryInput('');
    }
  };

  const handleDeleteMinistry = (ministryToDelete: string) => {
    setFormMinistries((prevMinistries) =>
      prevMinistries.filter((ministry) => ministry !== ministryToDelete)
    );
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.uid) {
      setError("Usuário não autenticado.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    
    // Só adicione ao FormData se o valor mudou
    if (formNome !== (userProfile?.nome || '')) formData.append('nome', formNome);
    if (formBio !== (userProfile?.bio || '')) formData.append('bio', formBio);
    if (formDataNascimento !== (userProfile?.dataNascimento || '')) formData.append('dataNascimento', formDataNascimento);
    if (formDataMembroDesde !== (userProfile?.dataMembroDesde || '')) formData.append('dataMembroDesde', formDataMembroDesde);
    
    // Adiciona a string de ministérios se houver mudança no array
    if (JSON.stringify(formMinistries) !== JSON.stringify(userProfile?.ministries || [])) {
        formData.append('ministries', formMinistries.join(',')); // Envia como string separada por vírgulas
    }

    if (selectedFile) formData.append('photo', selectedFile);

    // Verifica se houve alguma mudança real antes de enviar
    const hasTextChanges = formNome !== (userProfile?.nome || '') ||
                           formBio !== (userProfile?.bio || '') ||
                           formDataNascimento !== (userProfile?.dataNascimento || '') ||
                           formDataMembroDesde !== (userProfile?.dataMembroDesde || '') ||
                           JSON.stringify(formMinistries) !== JSON.stringify(userProfile?.ministries || []);
                           
    if (!hasTextChanges && !selectedFile) {
      setSuccess("Nenhuma alteração para salvar.");
      setIsSubmitting(false);
      return;
    }

    const result = await updateUserProfile(user.uid, formData);

    if (result.success) {
      setSuccess("Perfil atualizado com sucesso!");
      setSelectedFile(null); // Limpa o arquivo selecionado
      await refreshUserProfile(); // Recarrega o perfil do contexto para atualizar a UI
    } else {
      setError(result.message || "Falha ao atualizar o perfil.");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando perfil...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Você precisa estar logado para acessar esta página.</Alert>
        <Button component={Link} href="/login" variant="contained" sx={{ mt: 2 }}>Fazer Login</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Meu Perfil
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleOutlineIcon />}>{success}</Alert>}

      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          {/* Seção da Foto de Perfil */}
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            <Avatar
              alt={formNome || 'Usuário'}
              src={formPhotoPreview || undefined}
              sx={{ width: 120, height: 120, fontSize: 60 }}
            >
              {formNome ? formNome.charAt(0) : <CameraAltIcon />}
            </Avatar>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'grey.300',
                },
              }}
            >
              <CameraAltIcon />
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </IconButton>
          </Box>

          {/* Campos de Edição */}
          <TextField
            label="Nome de Exibição"
            fullWidth
            value={formNome}
            onChange={(e) => setFormNome(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Biografia (Opcional)"
            fullWidth
            multiline
            rows={3}
            value={formBio}
            onChange={(e) => setFormBio(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Data de Nascimento (Opcional)"
            type="date"
            fullWidth
            value={formDataNascimento}
            onChange={(e) => setFormDataNascimento(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Membro Desde (Opcional)"
            type="date"
            fullWidth
            value={formDataMembroDesde}
            onChange={(e) => setFormDataMembroDesde(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          {/* Campo para Ministérios */}
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ministérios
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {formMinistries.map((ministry) => (
                <Chip
                  key={ministry}
                  label={ministry}
                  onDelete={() => handleDeleteMinistry(ministry)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            <TextField
              label="Adicionar Ministério"
              fullWidth
              value={ministryInput}
              onChange={(e) => setMinistryInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Impede o submit do formulário
                  handleAddMinistry();
                }
              }}
              InputProps={{
                endAdornment: (
                  <Button onClick={handleAddMinistry} variant="text" size="small">
                    Adicionar
                  </Button>
                ),
              }}
            />
          </Box>


          {/* Informações adicionais não editáveis (mantidas do seu UserProfile) */}
          {userProfile?.igrejaId && (
            <TextField
              label="ID da Igreja"
              fullWidth
              value={userProfile.igrejaId}
              InputProps={{ readOnly: true }}
              margin="normal"
              variant="outlined"
              size="small"
            />
          )}
          {userProfile?.role && (
            <TextField
              label="Nível de Acesso"
              fullWidth
              value={userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              InputProps={{ readOnly: true }}
              margin="normal"
              variant="outlined"
              size="small"
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? 'Salvando...' : 'Atualizar Perfil'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}