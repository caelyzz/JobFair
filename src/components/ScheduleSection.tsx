import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './ScheduleSection.css';

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 16; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  slots.push('17:00');
  return slots;
}

interface BookedSlot {
  pcNumber: number;
  startSlot: string;
  endSlot: string;
  customerName: string;
}

function sessionToSlots(sessions: any[]): BookedSlot[] {
  return sessions.map(s => {
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    return {
      pcNumber: s.pc_number,
      startSlot: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
      endSlot: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      customerName: s.transactions?.customer_name || 'Player',
    };
  });
}

function isSlotBooked(bookedSlots: BookedSlot[], pcNumber: number, slot: string): BookedSlot | undefined {
  return bookedSlots.find((b) => {
    if (b.pcNumber !== pcNumber) return false;
    return slot >= b.startSlot && slot < b.endSlot;
  });
}

export const ScheduleSection: React.FC = () => {
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const pcNumbers = [1, 2, 3, 4];
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const fetchSessions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('pc_sessions')
      .select('*, transactions(customer_name)')
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString());
    if (data) setBookedSlots(sessionToSlots(data));
  };

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('schedule-landing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pc_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="schedule-section" id="schedule">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <span className="section-badge">
            <CalendarDays size={14} /> JADWAL HARI INI
          </span>
          <h2 className="section-title">
            Detail <span className="gradient-text">Jadwal</span>
          </h2>
          <p className="section-desc">Visualisasi slot waktu per 15 menit</p>
        </motion.div>

        <div className="schedule-legend">
          <div className="legend-item">
            <span className="legend-dot legend-available" />
            <span>Kosong</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-booked" />
            <span>Terisi</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="schedule-table-wrapper"
        >
          <div className="schedule-table">
            <div className="schedule-row schedule-header-row">
              <div className="schedule-pc-label header-label">PC</div>
              {timeSlots.map((slot) => (
                <div key={slot} className="schedule-cell header-cell">
                  {slot.endsWith(':00') ? slot : ''}
                </div>
              ))}
            </div>

            {pcNumbers.map((pcNum) => (
              <div key={pcNum} className="schedule-row">
                <div className="schedule-pc-label">PC {pcNum}</div>
                {timeSlots.map((slot) => {
                  const booked = isSlotBooked(bookedSlots, pcNum, slot);
                  return (
                    <div
                      key={`${pcNum}-${slot}`}
                      className={`schedule-cell ${booked ? 'cell-booked' : 'cell-available'}`}
                      title={booked ? `${booked.customerName} (${booked.startSlot} - ${booked.endSlot})` : `Kosong - ${slot}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
