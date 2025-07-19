
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, Target, Calendar } from 'lucide-react';

const Reports = () => {
  const monthlyData = [
    { month: 'Jan', leads: 45, completed: 32 },
    { month: 'Feb', leads: 52, completed: 41 },
    { month: 'Mar', leads: 38, completed: 28 },
    { month: 'Apr', leads: 61, completed: 52 },
    { month: 'May', leads: 55, completed: 43 },
    { month: 'Jun', leads: 67, completed: 58 },
  ];

  const categoryData = [
    { name: 'Software Development', value: 35, color: '#3B82F6' },
    { name: 'Digital Marketing', value: 25, color: '#10B981' },
    { name: 'Web Design', value: 20, color: '#F59E0B' },
    { name: 'Consulting', value: 15, color: '#EF4444' },
    { name: 'Others', value: 5, color: '#8B5CF6' },
  ];

  const stats = [
    {
      title: "Total Leads",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5%",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Monthly Growth",
      value: "23%",
      change: "+8%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Avg. Response Time",
      value: "2.4 days",
      change: "-12%",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your lead management performance and insights
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Leads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Lead Performance</CardTitle>
            <CardDescription>
              Track leads generated and completed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#3B82F6" name="Total Leads" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Category</CardTitle>
            <CardDescription>
              Distribution of leads across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes in your lead management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New lead created", details: "Software Development lead from California", time: "2 hours ago" },
              { action: "Lead status updated", details: "Marketing lead marked as completed", time: "4 hours ago" },
              { action: "Bulk import completed", details: "25 new leads imported from Excel", time: "1 day ago" },
              { action: "Report generated", details: "Monthly performance report exported", time: "2 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
