import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['hsl(16, 85%, 55%)', 'hsl(16, 85%, 45%)', 'hsl(16, 85%, 35%)', 'hsl(16, 85%, 25%)', 'hsl(16, 85%, 15%)'];

export default function AdminStats() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/admin/stats/overview'],
  });

  const { data: locationStats, isLoading: locationLoading } = useQuery({
    queryKey: ['/api/admin/stats/location'],
  });

  const { data: racismStats, isLoading: racismLoading } = useQuery({
    queryKey: ['/api/admin/stats/racism-type'],
  });

  const { data: ageStats, isLoading: ageLoading } = useQuery({
    queryKey: ['/api/admin/stats/age'],
  });

  const { data: genderStats, isLoading: genderLoading } = useQuery({
    queryKey: ['/api/admin/stats/gender'],
  });

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalVideos || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview?.pendingVideos || 0}</div>
            <Badge variant="secondary" className="mt-1">
              {overview?.totalVideos > 0 ? Math.round((overview?.pendingVideos / overview?.totalVideos) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview?.approvedVideos || 0}</div>
            <Badge variant="secondary" className="mt-1">
              {overview?.totalVideos > 0 ? Math.round((overview?.approvedVideos / overview?.totalVideos) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview?.rejectedVideos || 0}</div>
            <Badge variant="secondary" className="mt-1">
              {overview?.totalVideos > 0 ? Math.round((overview?.rejectedVideos / overview?.totalVideos) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vídeos por Localização</CardTitle>
          </CardHeader>
          <CardContent>
            {locationLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(16, 85%, 55%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Racism Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Racismo</CardTitle>
          </CardHeader>
          <CardContent>
            {racismLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={racismStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {racismStats?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Age Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Idade</CardTitle>
          </CardHeader>
          <CardContent>
            {ageLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageRange" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(16, 85%, 45%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            {genderLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {genderStats?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}