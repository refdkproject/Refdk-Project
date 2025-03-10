import { useForm, useFormContext } from 'react-hook-form';
import { Card, CardContent } from '../../../components/ui/Card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export function AddEventForm() {
  const { user } = useAuth();
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      region: '',
      city: '',
      skillLevel: '',
      numberOfVolunteer: 0,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      eventPic: null
    },
  });

  const onSubmit = async (data: any) => {
  
    const formData = new FormData();
    
    // Append text fields
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("city", data.city);
    formData.append("region", data.region);
    formData.append("location", data.location);
    formData.append("numberOfVolunteer", String(data.numberOfVolunteer));
    formData.append("startDate", new Date(data.startDate).toISOString().replace("Z", "+00:00"));
    formData.append("endDate", new Date(data.endDate).toISOString().replace("Z", "+00:00"));
  
    // Append file separately if it exists
    if (data.eventPic instanceof File) {
      formData.append("eventPic", data.eventPic);
    }
  
    try {
      const response = await fetch("https://50wqmqhq-5000.euw.devtunnels.ms/admin/event", {
        method: "POST",
        body: formData, // Send form data
        headers: {
          Authorization: `Bearer ${user?.token}`,
          // Do NOT add "Content-Type": "multipart/form-data" (browser will set it automatically)
        },
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create event.");
      }
  
      console.log("Event Created Successfully:", responseData);
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };
  
  return (
    <Card className="w-[90%] m-auto mt-4 p-6 bg-transparent">
      <h2 className="text-3xl font-bold mb-2">Add New Event</h2>
      <p className="text-gray-500 text-sm">Fill in the event details below.</p>

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
            <TextInputWithLabel nameInSchema="location" displayName="Location" placeholder="Enter location" />
            <TextInputWithLabel nameInSchema="eventPic" displayName="Event Image URL" placeholder="Enter image URL" type="file" />
          </CardContent>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Add Event</Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function TextInputWithLabel({
  displayName,
  nameInSchema,
  placeholder,
  type = 'text',
  className,
  labelClassName,
}: {
  displayName: string;
  nameInSchema: string;
  placeholder: string;
  type?: 'email' | 'text' | 'date' | 'number' | 'file';
  className?: string;
  labelClassName?: string;
}) {
  const { control, setValue } = useFormContext();

  return (
    <FormField
      control={control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClassName} htmlFor={nameInSchema}>
            {displayName}
          </FormLabel>
          {type === 'file' ? (
              <Input
                className={cn('bg-transparent', className)}
                type={type}
                id={nameInSchema}
                placeholder={placeholder}
                onChange={(e) => setValue(nameInSchema, e.target.files?.[0] || null)}
                accept="image/*"
                required
              />
            ) : (
              <Input
                className={cn('bg-transparent', className)}
                type={type}
                id={nameInSchema}
                placeholder={placeholder}
                {...field}
                required
              />
            )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
