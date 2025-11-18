"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Building, Calendar, User as UserIcon } from "lucide-react";
import { User } from "@/data/data";

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 3:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 1:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }

    
  };

  const getRoleLabel = (role: number) => {
    if (role === 1) return 'ADMIN';
    if (role === 0) return 'collaborateur';
    return String(role); // fallback pour autres valeurs (2, 3, etc.)
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" /> Mon Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="text-lg font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2 text-gray-800">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <Badge className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>         
              </div>
              <div>
                <p className="text-sm text-gray-500">Cabinet</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{user.cabinet?.name ?? "Non renseigné"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sociétés en favoris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.listeFavori?.societes?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tags créés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.tache?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dernière mise à jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
