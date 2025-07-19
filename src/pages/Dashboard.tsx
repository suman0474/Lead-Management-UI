
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BarChart, Users, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Leads",
      value: "1,234",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Active Leads",
      value: "856",
      change: "+8%",
      icon: TrendingUp,
    },
    {
      title: "Completed",
      value: "378",
      change: "+23%",
      icon: FileText,
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5%",
      icon: BarChart,
    },
  ];

  const quickActions = [
    {
      title: "Manage Leads",
      description: "View, edit, and manage all your leads in one place",
      action: () => navigate('/leads'),
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      title: "Add New Lead",
      description: "Create a new lead entry with all required information",
      action: () => navigate('/leads?action=new'),
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Generate Reports",
      description: "Create detailed reports and analytics",
      action: () => navigate('/reports'),
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      title: "Local Businesses",
      description: "Manage local business partnerships and connections",
      action: () => navigate('/businesses'),
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          What can we help you build today?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                  <div className="w-6 h-6 bg-white rounded opacity-90" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={action.action} className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
