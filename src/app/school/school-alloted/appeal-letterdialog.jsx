import { useState } from "react";
import { ClipboardList, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useApiMutation } from "@/hooks/use-mutation";
import { APPEAL_EMAIL, APPEAL_WHATSAPP } from "@/api";

export default function AppealLetterDialog({ row }) {
  const [open, setOpen] = useState(false);
  const [noofadopting, setNoofadopting] = useState("");
  const [designation, setDesignation] = useState("");
  const validateForm = () => {
    if (!row?.id) {
      toast.error("Allotment ID missing");
      return false;
    }

    if (!row?.receipt_no_of_ots) {
      toast.error("No of OTS missing");
      return false;
    }

    if (!noofadopting) {
      toast.error("Please enter number of adopting");
      return false;
    }

    if (!designation) {
      toast.error("Please select designation");
      return false;
    }

    return true;
  };
  const { trigger: sendEmail, loading: emailLoading } = useApiMutation();
  const { trigger: sendWhatsapp, loading: whatsappLoading } = useApiMutation();

  const payload = {
    allotment_id: row.id,
    noofots: row.receipt_no_of_ots,
    noofadopting,
    designation,
  };

  const handleEmail = async () => {
    if (!validateForm()) return;

    try {
      const res = await sendEmail({
        url: APPEAL_EMAIL,
        method: "post",
        data: payload,
      });

      if (res?.code === 201) {
        toast.success(res.message);
        setOpen(false);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleWhatsapp = async () => {
    if (!validateForm()) return;

    try {
      const res = await sendWhatsapp({
        url: APPEAL_WHATSAPP,
        method: "post",
        data: payload,
      });

      if (res?.code === 201) {
        toast.success(res.message);
        setOpen(false);
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);

        if (val) {
          setNoofadopting("");
          setDesignation("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <FileText className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Send Appeal Letter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>No of Adopting</Label>
            <Input
              type="number"
              value={noofadopting}
              onChange={(e) => setNoofadopting(e.target.value)}
              min={1}
            />
          </div>

          <div>
            <Label>Designation</Label>
            <Select onValueChange={setDesignation}>
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Promoter">Promoter</SelectItem>
                <SelectItem value="Secretary">Secretary</SelectItem>
                <SelectItem value="President">President</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleWhatsapp}
              disabled={whatsappLoading}
            >
              WhatsApp
            </Button>

            <Button onClick={handleEmail} disabled={emailLoading}>
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
