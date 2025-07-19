import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Phone, Mail, Linkedin, Globe } from "lucide-react";

export interface Lead {
  leadId: string;
  name: string;
  designation?: string;
  website?: string;
  leadLink?: string;
  occupation?: string;
  companyHeadcount?: string;
  state?: string;
  sentDate: string;
  sentBy: string;
  email?: string;
  mobileNumber?: string;
  comments?: string;
  linkedinAccountName?: string;
}

interface LeadDetailsPanelProps {
  lead: Lead;
  onClose: () => void;
}

const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({
  lead,
  onClose,
}) => {
  // Default email and phone number
  const defaultEmail = "ensarsales@gmail.com";
  const defaultPhoneNumber = "9849638167";

  // LinkedIn Handler
  const handleLinkedIn = () => {
    if (lead.linkedinAccountName) {
      window.open(
        `https://www.linkedin.com/in/${lead.linkedinAccountName}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
          lead.name
        )}`,
        "_blank"
      );
    }
  };

  // Email Handler
  const handleEmail = () => {
    const emailToUse = lead.email || defaultEmail;
    window.open(`mailto:${emailToUse}`, "_blank");
  };

  // Phone Handler
  const handleCall = () => {
    const phoneToUse = lead.mobileNumber || defaultPhoneNumber;
    window.open(`tel:${phoneToUse}`, "_blank");
  };

  // Website Handler
  const handleWebsite = () => {
    if (lead.website) {
      window.open(
        lead.website.startsWith("http")
          ? lead.website
          : `https://${lead.website}`,
        "_blank"
      );
    }
  };

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 bg-white shadow-lg z-30 border-l border-gray-200 flex flex-col">
      <Card className="h-full rounded-none border-0 flex flex-col">
        <CardHeader className="border-b border-gray-200 p-4 flex flex-row justify-between items-center sticky top-0 bg-white z-10">
          <CardTitle className="text-lg font-semibold">Lead Details</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3 text-sm text-black">
            <div>
              <strong>Name:</strong> {lead.name}
            </div>
            {lead.designation && (
              <div>
                <strong>Designation:</strong> {lead.designation}
              </div>
            )}
            {lead.occupation && (
              <div>
                <strong>Occupation:</strong> {lead.occupation}
              </div>
            )}
            {lead.state && (
              <div>
                <strong>State:</strong> {lead.state}
              </div>
            )}
            <div>
              <strong>Sent Date:</strong>{" "}
              {new Date(lead.sentDate).toLocaleDateString()}
            </div>
            <div>
              <strong>Sent By:</strong> {lead.sentBy}
            </div>
            {lead.companyHeadcount && (
              <div>
                <strong>Company Size:</strong> {lead.companyHeadcount}
              </div>
            )}
            {lead.email && (
              <div>
                <strong>Email:</strong> {lead.email}
              </div>
            )}
            {lead.mobileNumber && (
              <div>
                <strong>Phone:</strong> {lead.mobileNumber}
              </div>
            )}
            {lead.website && (
              <div className="break-words">
                <strong>Website:</strong>{" "}
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {lead.website}
                </a>
              </div>
            )}
            {lead.leadLink && (
              <div className="break-words">
                <strong>Lead Link:</strong>{" "}
                <a
                  href={lead.leadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {lead.leadLink}
                </a>
              </div>
            )}
            {lead.comments && (
              <div>
                <strong>Comments:</strong> {lead.comments}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <div className="flex gap-2">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                onClick={handleLinkedIn}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                View on LinkedIn
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                onClick={handleEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>

              {lead.website && (
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                  onClick={handleWebsite}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetailsPanel;
