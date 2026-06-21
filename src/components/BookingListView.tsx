import React from "react";
import { Booking } from "../types";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";

interface BookingListViewProps {
  bookings: Booking[];
}

export default function BookingListView({ bookings }: BookingListViewProps) {
  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-blue-400 uppercase tracking-widest text-[10px] font-bold font-mono tracking-wider block mb-1">Account Dashboard</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Client Onboarding Schedules
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Review upcoming 30-minute introductions, technical kickoffs, and contract reviews.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-medium text-white text-sm">No Appointments Scheduled Yet</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Go to the <strong>Service Catalog</strong> or meet a human assistant in the <strong>Agent Directory</strong> to schedule your introductory kickoff meeting.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-medium text-sm text-white">{booking.serviceName}</h3>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono mt-1.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Assistant: <strong className="text-slate-200">{booking.agentName}</strong></span>
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{booking.dateTime}</span>
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 mt-3 max-w-2xl leading-relaxed">
                      <strong>Client message:</strong> "{booking.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-mono block">Secured coordinates ID:</span>
                <span className="font-mono text-xs font-bold text-slate-300">{booking.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
