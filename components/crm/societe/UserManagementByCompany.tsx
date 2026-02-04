import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, UserPlus, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { getUtilisateurs, createUtilisateur, deleteUser, upgradeUser, updateUserCabinet } from "@/api/user";
import { getCabinets } from "@/api/cabinet";
import { Cabinet, User } from '@/data/data'
import { useUser } from "@/context/UserContext";
import { logout } from "@/api/auth";

interface NewUserForm {
  name: string;
  firstName: string;
  email: string;
  cabinetId: number;
  password: string;
}

const UserManagementByCompany = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<string>("all");
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChangeCabinetDialog, setShowChangeCabinetDialog] = useState(false);
  const [selectedUserForCabinet, setSelectedUserForCabinet] = useState<User | null>(null);
  const [targetCabinetId, setTargetCabinetId] = useState<string>("");
  const { toast } = useToast();
  const { currentUser } = useUser();
  
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est admin
  const isAdmin = currentUser?.role === 1;

  const form = useForm<NewUserForm>({
    defaultValues: {
      name: "",
      firstName: "",
      email: "",
      cabinetId: 1,
      password: generatePassword()
    },
  });

  useEffect(() => {
    getCabinets().then(cabinets => {
      setCabinets(Array.isArray(cabinets) ? cabinets : []);
    });
    getUtilisateurs().then(users => {
      setUsers(Array.isArray(users) ? users : []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCabinet = selectedCabinet === "all" ? true : user.cabinet.id === parseInt(selectedCabinet);
    return matchesSearch && matchesCabinet;
  });

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 1: return 'bg-red-100 text-red-800';
      case 0: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^*?";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }
  

  const onSubmit = async (data: NewUserForm) => {
    try {
      await createUtilisateur({ ...data });
      toast({
        title: "Utilisateur ajouté",
        description: `${data.firstName} ${data.name} a été ajouté avec succès.`,
      });
      form.reset();
      setShowAddDialog(false);
      // Recharge la liste après ajout
      const users = await getUtilisateurs();
      setUsers(Array.isArray(users) ? users : []);
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la création." });
    }
  };

  const handleUDelete = async (userId: number) => {
    try {
        await deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
    } catch {
        toast({
            title: "Erreur",
            description: "Erreur lors de la suppression de l'utilisateur.",
        });
        return;
    }
  };

  const handleUpgrade = async (userId: number) => {
    try {
      const updatedUser = await upgradeUser(userId);
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, role: updatedUser?.role || "ADMIN" }
          : user
      ));
      toast({
        title: "Utilisateur promu",
        description: "Le rôle de l'utilisateur a été mis à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upgrade de l'utilisateur.",
      });
    }
  };

  const handleChangeCabinet = async () => {
    if (!selectedUserForCabinet || !targetCabinetId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et un cabinet cible.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUserCabinet(selectedUserForCabinet.id, parseInt(targetCabinetId));
      
      const newCabinet = cabinets.find(c => c.id === parseInt(targetCabinetId));

      // Si l'admin change son propre cabinet, il doit se reconnecter pour rafraîchir le token
      if (selectedUserForCabinet.id === currentUser?.id) {
        toast({
          title: "Cabinet modifié",
          description: "Vous avez changé votre propre cabinet. Vous allez être déconnecté pour rafraîchir votre session.",
        });
        
        // Déconnexion après 2 secondes pour laisser le temps de lire le message
        setTimeout(async () => {
          try {
            await logout();
          } catch {
            // Ignorer les erreurs de logout
          }
          window.location.href = "/login";
        }, 2000);
        
        return;
      }

      // Mettre à jour la liste localement
      setUsers(prev => prev.map(user =>
        user.id === selectedUserForCabinet.id
          ? { ...user, cabinet: newCabinet! }
          : user
      ));

      toast({
        title: "Cabinet modifié",
        description: `${selectedUserForCabinet.firstName} ${selectedUserForCabinet.name} a été transféré vers ${newCabinet?.name}. L'utilisateur devra se reconnecter pour que le changement prenne effet.`,
      });

      setShowChangeCabinetDialog(false);
      setSelectedUserForCabinet(null);
      setTargetCabinetId("");
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors du changement de cabinet.",
        variant: "destructive",
      });
    }
  };

  const openChangeCabinetDialog = (user: User) => {
    setSelectedUserForCabinet(user);
    setTargetCabinetId(user.cabinet.id.toString());
    setShowChangeCabinetDialog(true);
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-center text-blue-600">Chargement des utilisateurs...</div>}

      {!loading && (
        <>
            
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
            </div>
            <Select value={selectedCabinet} onValueChange={setSelectedCabinet}>
                <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les cabinets" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Tous les cabinets</SelectItem>
                {cabinets.map((cabinet) => (
                    <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                    {cabinet.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Nouvel utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                            <Input placeholder="Prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                            <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="email@exemple.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <div className="flex gap-2">
                                <FormControl>
                                <Input
                                    type="text"
                                    {...field}
                                    value={field.value ?? ""}
                                    />
                                </FormControl>
                                <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setValue('password', generatePassword())}
                                >
                                Générer
                                </Button>
                                <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(form.getValues('password'))}
                                >
                                Copier
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="cabinetId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cabinet</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un cabinet" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {cabinets.map((cabinet) => (
                                <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                                {cabinet.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="flex gap-2 pt-4">
                    <Button type="submit">Créer</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Annuler
                    </Button>
                    </div>
                </form>
                </Form>
            </DialogContent>
            </Dialog>

            {/* Dialog pour changer de cabinet (admin uniquement) */}
            {isAdmin && (
              <Dialog open={showChangeCabinetDialog} onOpenChange={setShowChangeCabinetDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le cabinet d&apos;un utilisateur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {selectedUserForCabinet && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">
                          {selectedUserForCabinet.firstName} {selectedUserForCabinet.name}
                        </p>
                        <p className="text-sm text-gray-500">{selectedUserForCabinet.email}</p>
                        <p className="text-sm text-gray-500">
                          Cabinet actuel: <span className="font-medium">{selectedUserForCabinet.cabinet.name}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nouveau cabinet</label>
                      <Select value={targetCabinetId} onValueChange={setTargetCabinetId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un cabinet" />
                        </SelectTrigger>
                        <SelectContent>
                          {cabinets.map((cabinet) => (
                            <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                              {cabinet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleChangeCabinet}>
                        Confirmer le transfert
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowChangeCabinetDialog(false);
                          setSelectedUserForCabinet(null);
                          setTargetCabinetId("");
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
        </div>

        {/* Liste des utilisateurs */}
        <Card>
            <CardHeader>
            <CardTitle>
                Liste des utilisateurs  {" "}
                {selectedCabinet !== "all" && ` - ${cabinets.find(c => c.id === parseInt(selectedCabinet))?.name} `}
                ({filteredUsers.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Cabinet</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 1 ? "Admin" : "Collaborateur"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.cabinet.name}</TableCell>
                    <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                          {/* Bouton changer de cabinet (admin uniquement) */}
                          {isAdmin && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openChangeCabinetDialog(user)}
                                title="Changer de cabinet"
                            >
                                <Building2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpgrade(user.id)}
                          >
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUDelete(user.id)}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </>
        )}
    </div>
  );
};

export default UserManagementByCompany;