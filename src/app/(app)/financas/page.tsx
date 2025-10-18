// src/app/(app)/financas/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, where, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
    Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl,
    CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FinancasLancamento, Membro } from '@/types';
import { parse, format, isValid } from 'date-fns';

export default function FinancasPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const [lancamentos, setLancamentos] = useState<FinancasLancamento[]>([]);
    const [membrosMap, setMembrosMap] = useState<Map<string, string>>(new Map());
    const [loadingLancamentos, setLoadingLancamentos] = useState(true);
    const [loadingMembros, setLoadingMembros] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados do formulário de adicionar
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
    const [categoria, setCategoria] = useState('');
    const [dataStr, setDataStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [membroId, setMembroId] = useState('');
    const [membrosDisponiveis, setMembrosDisponiveis] = useState<Membro[]>([]);

    // Estados da tabela e paginação
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estado para filtro por mês
    const [mesAnoSelecionado, setMesAnoSelecionado] = useState(() => format(new Date(), 'yyyy-MM'));

    // Estados para edição
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [lancamentoEdit, setLancamentoEdit] = useState<FinancasLancamento | null>(null);
    const [editDescricao, setEditDescricao] = useState('');
    const [editValor, setEditValor] = useState('');
    const [editTipo, setEditTipo] = useState<'entrada' | 'saida'>('entrada');
    const [editCategoria, setEditCategoria] = useState('');
    const [editDataStr, setEditDataStr] = useState('');
    const [editMembroId, setEditMembroId] = useState('');

    // Verificação de autenticação e permissão
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Carregando dados do usuário...</Typography>
            </Box>
        );
    }

    if (!userProfile || !['dirigente', 'pastor_presidente'].includes(userProfile.role as string)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Typography variant="h6" color="error">Acesso negado. Você não tem permissão para visualizar esta página.</Typography>
            </Box>
        );
    }

    // 1. Buscar Membros para dropdown e map
    useEffect(() => {
        const fetchMembros = async () => {
            setLoadingMembros(true);
            try {
                const membrosCol = collection(db, 'membros');
                const q = query(membrosCol, orderBy('nome'));
                const snapshot = await getDocs(q);
                const membrosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membro));
                setMembrosDisponiveis(membrosData);

                const map = new Map<string, string>();
                membrosData.forEach(m => map.set(m.id, m.nome));
                setMembrosMap(map);

            } catch (err) {
                console.error("Erro ao buscar membros:", err);
                setError("Erro ao carregar lista de membros.");
            } finally {
                setLoadingMembros(false);
            }
        };
        fetchMembros();
    }, []);

    // 2. Buscar lançamentos com onSnapshot, incluindo parse e ordenação
// Na definição dos lançamentos:
useEffect(() => {
  if (!userProfile?.igrejaId) return;

  setLoadingLancamentos(true);
  const q = query(
    collection(db, 'financas'),
    where('igrejaId', '==', userProfile.igrejaId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const lancamentosData = snapshot.docs.map(doc => {
      const data = doc.data();
      const dataParsed = parse(data.data, 'dd/MM/yyyy', new Date());
      return {
        id: doc.id,
        ...data,
        dataParsed: isValid(dataParsed) ? dataParsed : null,
      } as FinancasLancamento;
    });

    lancamentosData.sort((a, b) => {
      if (!a.dataParsed) return 1;
      if (!b.dataParsed) return -1;
      return b.dataParsed.getTime() - a.dataParsed.getTime();
    });

    setLancamentos(lancamentosData);
    setLoadingLancamentos(false);
  }, (error) => {
    console.error(error);
    setError('Erro ao buscar lançamentos');
    setLoadingLancamentos(false);
  });

  return () => unsubscribe();
}, [userProfile?.igrejaId]);


    // 3. Função para adicionar lançamento
    const handleAddLancamento = async () => {
        if (!userProfile || !userProfile.igrejaId) {
            setError("Usuário não autenticado ou igreja não identificada para registrar lançamentos.");
            return;
        }
        if (!valor || !categoria || !dataStr || parseFloat(valor) <= 0) {
            alert("Preencha todos os campos obrigatórios (Valor, Categoria, Data) e o valor deve ser maior que zero.");
            return;
        }
        if (categoria === 'Dízimo' && !membroId) {
            alert("Para lançamentos do tipo 'Dízimo', selecione um membro.");
            return;
        }

        try {
            const dataParaSalvar = format(new Date(dataStr + 'T12:00:00Z'), 'dd/MM/yyyy'); // Formato DD/MM/YYYY

            await addDoc(collection(db, 'financas'), {
                tipo,
                descricao: descricao || null,
                valor: parseFloat(valor),
                data: dataParaSalvar,
                categoria,
                membroId: membroId || null,
                registradoPor: userProfile.uid,
                registradoEm: Timestamp.now(),
                igrejaId: userProfile.igrejaId,
            });

            setDescricao('');
            setValor('');
            setCategoria('');
            setMembroId('');
            setError(null);
        } catch (error) {
            console.error("Erro ao adicionar lançamento:", error);
            setError("Erro ao salvar lançamento: " + (error as Error).message);
        }
    };

    // 4. Função para abrir diálogo de edição
    const openEditDialog = (lanc: FinancasLancamento) => {
        setLancamentoEdit(lanc);
        setEditDescricao(lanc.descricao || '');
        setEditValor(lanc.valor.toString());
        setEditTipo(lanc.tipo);
        setEditCategoria(lanc.categoria);
        setEditDataStr(lanc.dataParsed ? format(lanc.dataParsed, 'yyyy-MM-dd') : '');
        setEditMembroId(lanc.membroId || '');
        setEditDialogOpen(true);
    };

    // 5. Função para salvar edição
    const handleSaveEdit = async () => {
        if (!lancamentoEdit) return;
        if (!editValor || !editCategoria || !editDataStr || parseFloat(editValor) <= 0) {
            alert("Preencha todos os campos obrigatórios (Valor, Categoria, Data) e o valor deve ser maior que zero.");
            return;
        }
        if (editCategoria === 'Dízimo' && !editMembroId) {
            alert("Para lançamentos do tipo 'Dízimo', selecione um membro.");
            return;
        }

        try {
            const dataParaSalvar = format(new Date(editDataStr + 'T12:00:00Z'), 'dd/MM/yyyy');

            const docRef = doc(db, 'financas', lancamentoEdit.id);
            await updateDoc(docRef, {
                tipo: editTipo,
                descricao: editDescricao || null,
                valor: parseFloat(editValor),
                data: dataParaSalvar,
                categoria: editCategoria,
                membroId: editMembroId || null,
            });

            setEditDialogOpen(false);
            setLancamentoEdit(null);
        } catch (error) {
            console.error("Erro ao editar lançamento:", error);
            alert("Erro ao salvar edição: " + (error as Error).message);
        }
    };

    // 6. Função para deletar lançamento
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
        try {
            await deleteDoc(doc(db, 'financas', id));
        } catch (error) {
            console.error("Erro ao deletar lançamento:", error);
            alert("Erro ao deletar lançamento: " + (error as Error).message);
        }
    };

    // 7. Gerar meses disponíveis para filtro a partir dos lançamentos
    const mesesDisponiveis = useMemo(() => {
        const mesesSet = new Set<string>();
        lancamentos.forEach(l => {
            if (l.dataParsed) {
                mesesSet.add(format(l.dataParsed, 'yyyy-MM'));
            }
        });
        return Array.from(mesesSet).sort((a, b) => b.localeCompare(a)); // mais recente primeiro
    }, [lancamentos]);

    // 8. Filtrar lançamentos pelo mês selecionado
    const lancamentosFiltrados = useMemo(() => {
        if (!mesAnoSelecionado) return lancamentos;
        return lancamentos.filter(l => {
            if (!l.dataParsed) return false;
            const anoMesLanc = format(l.dataParsed, 'yyyy-MM');
            return anoMesLanc === mesAnoSelecionado;
        });
    }, [lancamentos, mesAnoSelecionado]);

    // 9. Totais conforme filtro
    const totalEntradas = useMemo(() => {
        return lancamentosFiltrados.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + l.valor, 0);
    }, [lancamentosFiltrados]);

    const totalSaidas = useMemo(() => {
        return lancamentosFiltrados.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + l.valor, 0);
    }, [lancamentosFiltrados]);

    const saldoAtual = totalEntradas - totalSaidas;

    // 10. Paginação
    const lancamentosPaginados = useMemo(() => {
        const start = page * rowsPerPage;
        return lancamentosFiltrados.slice(start, start + rowsPerPage);
    }, [lancamentosFiltrados, page, rowsPerPage]);

    // Handlers para paginação
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Financeiro</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Formulário para adicionar lançamento */}
            <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Adicionar Lançamento</Typography>
                <Box
                    component="form"
                    onSubmit={e => {
                        e.preventDefault();
                        handleAddLancamento();
                    }}
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
                >
                    <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel id="tipo-label">Tipo</InputLabel>
                        <Select
                            labelId="tipo-label"
                            value={tipo}
                            label="Tipo"
                            onChange={e => setTipo(e.target.value as 'entrada' | 'saida')}
                        >
                            <MenuItem value="entrada">Entrada</MenuItem>
                            <MenuItem value="saida">Saída</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Descrição"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: 180 }}
                        inputProps={{ maxLength: 100 }}
                    />

                    <TextField
                        label="Valor"
                        type="number"
                        inputProps={{ min: 0, step: '0.01' }}
                        value={valor}
                        onChange={e => setValor(e.target.value)}
                        sx={{ width: 120 }}
                        required
                    />

                    <TextField
                        label="Categoria"
                        value={categoria}
                        onChange={e => setCategoria(e.target.value)}
                        sx={{ minWidth: 140 }}
                        required
                        helperText="Ex: Dízimo, Oferta, Despesa..."
                    />

                    <TextField
                        label="Data"
                        type="date"
                        value={dataStr}
                        onChange={e => setDataStr(e.target.value)}
                        sx={{ width: 140 }}
                        required
                        InputLabelProps={{ shrink: true }}
                    />

                    {categoria === 'Dízimo' && (
                        <FormControl sx={{ minWidth: 160 }}>
                            <InputLabel id="membro-label">Membro</InputLabel>
                            <Select
                                labelId="membro-label"
                                value={membroId}
                                label="Membro"
                                onChange={e => setMembroId(e.target.value)}
                                required
                            >
                                {loadingMembros ? (
                                    <MenuItem disabled>Carregando...</MenuItem>
                                ) : (
                                    membrosDisponiveis.map(m => (
                                        <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    )}

                    <Button variant="contained" type="submit" sx={{ alignSelf: 'center' }}>Adicionar</Button>
                </Box>
            </Paper>

            {/* Filtro de mês */}
            <FormControl size="small" sx={{ mb: 2, minWidth: 160 }}>
                <InputLabel id="label-mes-ano">Filtrar por Mês</InputLabel>
                <Select
                    labelId="label-mes-ano"
                    value={mesAnoSelecionado}
                    label="Filtrar por Mês"
                    onChange={(e) => setMesAnoSelecionado(e.target.value)}
                >
                    {mesesDisponiveis.length === 0 ? (
                        <MenuItem value="">
                            Nenhum mês disponível
                        </MenuItem>
                    ) : (
                        mesesDisponiveis.map(mes => (
                            <MenuItem key={mes} value={mes}>
                                {format(parse(mes, 'yyyy-MM', new Date()), 'MM/yyyy')}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            {/* Totais */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Entradas: R$ {totalEntradas.toFixed(2)}</Typography>
                <Typography variant="subtitle1">Saídas: R$ {totalSaidas.toFixed(2)}</Typography>
                <Typography variant="h6">Saldo: R$ {saldoAtual.toFixed(2)}</Typography>
            </Box>

            {/* Tabela de lançamentos */}
            {loadingLancamentos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper>
                    <TableContainer>
                        <Table size="small" aria-label="Tabela de lançamentos financeiros">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Categoria</TableCell>
                                    <TableCell>Membro</TableCell>
                                    <TableCell align="right">Valor (R$)</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lancamentosPaginados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Nenhum lançamento encontrado para este mês.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {lancamentosPaginados.map(l => (
                                    <TableRow key={l.id}>
                                        <TableCell>{l.dataParsed ? format(l.dataParsed, 'dd/MM/yyyy') : l.data}</TableCell>
                                        <TableCell>{l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</TableCell>
                                        <TableCell>{l.descricao || '-'}</TableCell>
                                        <TableCell>{l.categoria}</TableCell>
                                        <TableCell>{l.membroNome || '-'}</TableCell>
                                        <TableCell align="right">{l.valor.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => openEditDialog(l)} aria-label="Editar lançamento">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(l.id)} aria-label="Excluir lançamento">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={lancamentosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {/* Diálogo de edição */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Lançamento</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <FormControl>
                            <InputLabel id="edit-tipo-label">Tipo</InputLabel>
                            <Select
                                labelId="edit-tipo-label"
                                value={editTipo}
                                label="Tipo"
                                onChange={e => setEditTipo(e.target.value as 'entrada' | 'saida')}
                            >
                                <MenuItem value="entrada">Entrada</MenuItem>
                                <MenuItem value="saida">Saída</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Descrição"
                            value={editDescricao}
                            onChange={e => setEditDescricao(e.target.value)}
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            inputProps={{ min: 0, step: '0.01' }}
                            value={editValor}
                            onChange={e => setEditValor(e.target.value)}
                            required
                        />

                        <TextField
                            label="Categoria"
                            value={editCategoria}
                            onChange={e => setEditCategoria(e.target.value)}
                            required
                        />

                        <TextField
                            label="Data"
                            type="date"
                            value={editDataStr}
                            onChange={e => setEditDataStr(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />

                        {editCategoria === 'Dízimo' && (
                            <FormControl>
                                <InputLabel id="edit-membro-label">Membro</InputLabel>
                                <Select
                                    labelId="edit-membro-label"
                                    value={editMembroId}
                                    label="Membro"
                                    onChange={e => setEditMembroId(e.target.value)}
                                    required
                                >
                                    {membrosDisponiveis.map(m => (
                                        <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
