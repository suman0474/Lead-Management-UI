
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Phone, Mail } from 'lucide-react';

const Businesses = () => {
  const businesses = [
    {
      id: 1,
      name: "Tech Innovations Hub",
      type: "Technology",
      location: "San Francisco, CA",
      phone: "+1 (555) 123-4567",
      email: "contact@techinnovations.com",
      description: "Leading technology solutions provider in the Bay Area",
    },
    {
      id: 2,
      name: "Green Valley Marketing",
      type: "Marketing Agency",
      location: "Austin, TX",
      phone: "+1 (555) 234-5678",
      email: "hello@greenvalleymarketing.com",
      description: "Full-service marketing agency specializing in digital campaigns",
    },
    {
      id: 3,
      name: "Creative Design Studio",
      type: "Design Agency",
      location: "New York, NY",
      phone: "+1 (555) 345-6789",
      email: "info@creativedesignstudio.com",
      description: "Award-winning design studio for web and mobile applications",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Local Businesses</h1>
          <p className="text-muted-foreground">
            Manage your local business partnerships and connections
          </p>
        </div>
        <Button>
          <Building className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>{business.type}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{business.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {business.location}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {business.phone}
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {business.email}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Businesses;
