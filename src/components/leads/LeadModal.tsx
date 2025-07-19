
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lead } from '@/types/lead';

interface LeadModalProps {
  lead: Lead | null;
  mode: 'view' | 'edit' | 'create';
  onSave: (lead: Partial<Lead>) => void;
  onClose: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    designation: '',
    website: '',
    leadLink: '',
    occupation: '',
    companyHeadcount: '',
    state: '',
    sentDate: '',
    sentBy: '',
    email: '',
    mobileNumber: '',
    comments: '',
    linkedinAccountName: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    } else {
      setFormData({
        name: '',
        designation: '',
        website: '',
        leadLink: '',
        occupation: '',
        companyHeadcount: '',
        state: '',
        sentDate: new Date().toISOString().split('T')[0],
        sentBy: '',
        email: '',
        mobileNumber: '',
        comments: '',
        linkedinAccountName: '',
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Lead' : mode === 'edit' ? 'Edit Lead' : 'Lead Details';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Fill in the details to create a new lead.'}
            {mode === 'edit' && 'Update the lead information below.'}
            {mode === 'view' && 'View the complete lead information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter lead name"
                readOnly={isReadOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation || ''}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="Enter designation"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="Enter website URL"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="leadLink">Lead Link</Label>
              <Input
                id="leadLink"
                value={formData.leadLink || ''}
                onChange={(e) => handleChange('leadLink', e.target.value)}
                placeholder="Enter lead link"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="occupation">Occupation *</Label>
              <Input
                id="occupation"
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                placeholder="Enter occupation"
                readOnly={isReadOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="companyHeadcount">Company Headcount</Label>
              <Input
                id="companyHeadcount"
                value={formData.companyHeadcount || ''}
                onChange={(e) => handleChange('companyHeadcount', e.target.value)}
                placeholder="Enter company headcount"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="Enter state"
                readOnly={isReadOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="sentDate">Sent Date *</Label>
              <Input
                id="sentDate"
                type="date"
                value={formData.sentDate || ''}
                onChange={(e) => handleChange('sentDate', e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="sentBy">Sent By *</Label>
              <Input
                id="sentBy"
                value={formData.sentBy || ''}
                onChange={(e) => handleChange('sentBy', e.target.value)}
                placeholder="Enter sender name"
                readOnly={isReadOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber || ''}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                placeholder="Enter mobile number"
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="linkedinAccountName">LinkedIn Account Name</Label>
              <Input
                id="linkedinAccountName"
                value={formData.linkedinAccountName || ''}
                onChange={(e) => handleChange('linkedinAccountName', e.target.value)}
                placeholder="Enter LinkedIn account name"
                readOnly={isReadOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments || ''}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Enter any additional comments..."
              readOnly={isReadOnly}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" className=" h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-base transition-all duration-200">
                {mode === 'create' ? 'Create Lead' : 'Update Lead'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
