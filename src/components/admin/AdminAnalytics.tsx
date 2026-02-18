import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const appointmentData = [
    { name: 'Mon', appointments: 40 },
    { name: 'Tue', appointments: 55 },
    { name: 'Wed', appointments: 48 },
    { name: 'Thu', appointments: 70 },
    { name: 'Fri', appointments: 85 },
    { name: 'Sat', appointments: 30 },
    { name: 'Sun', appointments: 25 },
];

const emergencyData = [
    { type: 'Cardiac', count: 12, fill: '#ef4444' },
    { type: 'Trauma', count: 18, fill: '#f97316' },
    { type: 'Respiratory', count: 8, fill: '#eab308' },
    { type: 'Neurological', count: 5, fill: '#8b5cf6' },
];

const loadColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];
const departmentLoad = [
    { name: 'OPD', value: 45 },
    { name: 'Radiology', value: 25 },
    { name: 'Laboratory', value: 15 },
    { name: 'Pharmacy', value: 15 },
];

export default function AdminAnalytics() {
    return (
        <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="backdrop-blur-xl bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Appointment Trends (Weekly)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={appointmentData}>
                                    <defs>
                                        <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="appointments" stroke="#6366f1" fillOpacity={1} fill="url(#colorApp)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Emergency Frequency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="backdrop-blur-xl bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Emergency Category Split</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={emergencyData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="type" type="category" stroke="#ffffff60" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Department Load Distribution */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Clinical Resource Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentLoad}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {departmentLoad.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={loadColors[index % loadColors.length]} stroke="rgba(255,255,255,0.05)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#ffffff60' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
