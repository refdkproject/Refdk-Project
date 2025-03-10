import { useForm, useFormContext } from 'react-hook-form';
import { Card, CardContent } from '../../../components/ui/Card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

type EventFormValues = {
  name: string;
  description: string;
  region: string;
  city: string;
  skillLevel: string;
  numberOfVolunteer: number;
  startDate: string;
  endDate: string;
  location: string;
  eventPic: any;
};


export function UpdateEventForm() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); 
  const [existingUrl, setExistingUrl] = useState<string>('https://www.svgrepo.com/show/508699/landscape-placeholder.svg');

  const form = useForm<EventFormValues>({
    defaultValues: {
      name: '',
      description: '',
      region: '',
      city: '',
      skillLevel: '',
      numberOfVolunteer: 0,
      startDate: '',
      endDate: '',
      location: '',
      eventPic: 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
    },
  });

  useEffect(() => {
    async function fetchEventData() {
      if (!id) return; 

      try {
        const response = await fetch(`https://50wqmqhq-5000.euw.devtunnels.ms/admin/event/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch event data');

        const data = await response.json();

        if (data) {
          const { eventPic, ...eventData } = data.data;
          setExistingUrl(`https://50wqmqhq-5000.euw.devtunnels.ms/${eventPic}`);
          form.reset({ ...eventData, eventPic: '' }); // Reset without overwriting file input
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    }

    fetchEventData();
  }, [id, form]);


  const onSubmit = async (data: EventFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('city', data.city);
      formData.append('region', data.region);
      formData.append('location', data.location);
      formData.append('numberOfVolunteer', (data.numberOfVolunteer).toString());
      formData.append('skillLevel', data.skillLevel);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      
      if (data.eventPic && data.eventPic instanceof File) {
        formData.append('eventPic', data.eventPic); // Append file only if new file is selected
      }

      const response = await fetch(`https://50wqmqhq-5000.euw.devtunnels.ms/admin/event/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update Institution Engagement.');
      }

      console.log('Event Updated Successfully:', responseData);
      toast.success('Institution Engagement updated successfully!');

      // Update the image preview after a successful update
      if (data.eventPic && data.eventPic instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            setExistingUrl(reader.result);
          }
        };
        reader.readAsDataURL(data.eventPic);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update Institution Engagement. Please try again.');
    }
  };

  return (
    <Card className="w-[90%] m-auto mt-4 p-6 bg-transparent">
      <h2 className="text-3xl font-bold mb-2">Update Event</h2>
      <p className="text-gray-500 text-sm">Modify the event details below.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-0">
            <TextInputWithLabel nameInSchema="name" displayName="Event Name" placeholder="Enter event name" />
            <TextInputWithLabel nameInSchema="description" displayName="Description" placeholder="Enter event description" />
            <TextInputWithLabel nameInSchema="region" displayName="Region" placeholder="Enter region" />
            <TextInputWithLabel nameInSchema="city" displayName="City" placeholder="Enter city" />
            <TextInputWithLabel nameInSchema="skillLevel" displayName="Skill Level" placeholder="Enter skill level" />
            <TextInputWithLabel nameInSchema="numberOfVolunteer" displayName="Volunteers Needed" placeholder="Enter number" type="number" />
            <TextInputWithLabel nameInSchema="startDate" displayName="Start Date" placeholder="YYYY-MM-DD" type="date" />
            <TextInputWithLabel nameInSchema="endDate" displayName="End Date" placeholder="YYYY-MM-DD" type="date" />
            <TextInputWithLabel nameInSchema="eventPic" displayName="Event Image" placeholder="Upload an image" type="file" />
            <TextInputWithLabel nameInSchema="location" displayName="Location" placeholder="Enter location" />
          </CardContent>


          <img className="w-[20%]" src={existingUrl} alt="Event Pic" />

          <div className="mt-4 flex justify-end">
            <Button type="submit">Update Event</Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}



function TextInputWithLabel({
  displayName,
  nameInSchema,
  type = 'text',
  placeholder,
  className,
  labelClassName,
  disabled = false,
}: {
  displayName: string;
  nameInSchema: string;
  type?: 'email' | 'text' | 'date' | 'number' | 'file';
  className?: string;
  placeholder?: string;
  labelClassName?: string;
  disabled?: boolean;
}) {
  const form = useFormContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClassName} htmlFor={nameInSchema}>
            {displayName}
          </FormLabel>
          <FormControl>
            {type === 'file' ? (
              <Input
                className={cn('bg-transparent', className)}
                type="file"
                id={nameInSchema}
                disabled={disabled}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    form.setValue('eventPic', file);
                    field.onChange(file); 

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (reader.result && typeof reader.result === 'string') {
                        setPreviewUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            ) : (
              <Input
                className={cn('bg-transparent', className)}
                type={type}
                id={nameInSchema}
                disabled={disabled}
                placeholder={placeholder}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
          {type === 'file' && previewUrl && (
            <img src={previewUrl} alt="Preview" className="mt-2 w-[100px] h-[100px] object-cover" />
          )}
        </FormItem>
      )}
    />
  );
}
