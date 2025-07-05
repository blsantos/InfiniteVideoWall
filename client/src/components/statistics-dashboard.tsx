import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface LocationStat {
  location: string;
  count: number;
}

interface RacismTypeStat {
  racismType: string;
  count: number;
}

interface AgeStat {
  ageRange: string;
  count: number;
}

interface GenderStat {
  gender: string;
  count: number;
}

const COLORS = ['#1F2937', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export default function StatisticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics/overview'],
  });

  const { data: locationStats, isLoading: locationLoading } = useQuery<LocationStat[]>({
    queryKey: ['/api/statistics/location'],
  });

  const { data: racismTypeStats, isLoading: racismTypeLoading } = useQuery<RacismTypeStat[]>({
    queryKey: ['/api/statistics/racism-type'],
  });

  const { data: ageStats, isLoading: ageLoading } = useQuery<AgeStat[]>({
    queryKey: ['/api/statistics/age'],
  });

  const { data: genderStats, isLoading: genderLoading } = useQuery<GenderStat[]>({
    queryKey: ['/api/statistics/gender'],
  });

  const exportData = () => {
    if (!locationStats) return;

    const csvData = locationStats.map(stat => ({
      location: stat.location,
      total: stat.count,
      // Additional breakdown would come from more detailed API endpoints
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estatisticas_racismo_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatRacismType = (type: string) => {
    const types: { [key: string]: string } = {
      'institucional': 'Institucional',
      'estrutural': 'Estrutural',
      'escolar': 'Escolar',
      'mercado_trabalho': 'Mercado de trabalho',
      'religioso': 'Religioso',
      'linguístico': 'Linguístico',
      'outro': 'Outro',
    };
    return types[type] || type;
  };

  const formatGender = (gender: string) => {
    const genders: { [key: string]: string } = {
      'M': 'Masculino',
      'F': 'Feminino',
      'Outro': 'Outro',
      'Prefiro não informar': 'Prefiro não informar',
    };
    return genders[gender] || gender;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Estatísticas</h2>
            <p className="text-gray-600">Análise demográfica e geográfica dos relatos</p>
          </div>
          <Button onClick={exportData} disabled={!locationStats}>
            <i className="fas fa-download mr-2"></i>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de vídeos</p>
                    <p className="text-2xl font-bold text-primary">{stats?.totalVideos || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-video text-blue-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprovados</p>
                    <p className="text-2xl font-bold text-success">{stats?.approvedVideos || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Localizações</p>
                    <p className="text-2xl font-bold text-secondary">{locationStats?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-yellow-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tipos de racismo</p>
                    <p className="text-2xl font-bold text-accent">{racismTypeStats?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-pie text-red-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Idade</CardTitle>
          </CardHeader>
          <CardContent>
            {ageLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : ageStats && ageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageRange" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(207, 90%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Racism Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Racismo</CardTitle>
          </CardHeader>
          <CardContent>
            {racismTypeLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : racismTypeStats && racismTypeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={racismTypeStats.map((item, index) => ({
                      name: formatRacismType(item.racismType),
                      value: item.count,
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {racismTypeStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl text-gray-400 mb-4"></i>
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
          </CardHeader>
          <CardContent>
            {locationLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : locationStats && locationStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationStats.slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(25, 95%, 53%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-map text-4xl text-gray-400 mb-4"></i>
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            {genderLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : genderStats && genderStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderStats.map((item, index) => ({
                      name: formatGender(item.gender),
                      value: item.count,
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl text-gray-400 mb-4"></i>
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dados detalhados por localização</CardTitle>
        </CardHeader>
        <CardContent>
          {locationLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : locationStats && locationStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localização</TableHead>
                    <TableHead>Total de relatos</TableHead>
                    <TableHead>Porcentagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationStats.map((stat, index) => {
                    const totalVideos = stats?.approvedVideos || 1;
                    const percentage = ((stat.count / totalVideos) * 100).toFixed(1);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.location}</TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell>{percentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-table text-4xl text-gray-400 mb-4"></i>
              <p>Nenhum dado disponível para exibir</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
