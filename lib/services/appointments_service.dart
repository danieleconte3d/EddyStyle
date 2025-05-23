import 'package:cloud_firestore/cloud_firestore.dart';

/// Modello dell'appuntamento
class Appointment {
  final String id; // id del documento Firestore
  final DateTime dateTime;
  final String customer; // nome cliente
  final String employee; // id o nome del dipendente
  final String notes;

  Appointment({
    required this.id,
    required this.dateTime,
    required this.customer,
    required this.employee,
    this.notes = '',
  });

  /// Crea un [Appointment] da un documento Firestore.
  factory Appointment.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return Appointment(
      id: doc.id,
      dateTime: (data['dateTime'] as Timestamp).toDate(),
      customer: data['customer'] as String,
      employee: data['employee'] as String,
      notes: (data['notes'] ?? '') as String,
    );
  }

  /// Converte il modello in JSON per Firestore.
  Map<String, dynamic> toJson() => {
        'dateTime': Timestamp.fromDate(dateTime),
        'customer': customer,
        'employee': employee,
        'notes': notes,
      };
}

/// Servizio centralizzato per interagire con la collection "appointments" di Firestore.
class AppointmentsService {
  final _db = FirebaseFirestore.instance;
  final _collectionPath = 'appointments';

  CollectionReference<Map<String, dynamic>> get _col =>
      _db.collection(_collectionPath);

  /// Stream di tutti gli appuntamenti ordinati per data/ora.
  Stream<List<Appointment>> streamAll() {
    return _col
        .orderBy('dateTime')
        .snapshots()
        .map((snap) => snap.docs.map(Appointment.fromDoc).toList());
  }

  /// Stream degli appuntamenti di un determinato giorno.
  Stream<List<Appointment>> streamByDay(DateTime day) {
    final start = DateTime(day.year, day.month, day.day);
    final end = start.add(const Duration(days: 1));

    return _col
        .where('dateTime', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
        .where('dateTime', isLessThan: Timestamp.fromDate(end))
        .orderBy('dateTime')
        .snapshots()
        .map((snap) => snap.docs.map(Appointment.fromDoc).toList());
  }

  /// Aggiunge un nuovo appuntamento.
  Future<void> add(Appointment appointment) async {
    await _col.add(appointment.toJson());
  }

  /// Aggiorna un appuntamento esistente.
  Future<void> update(Appointment appointment) async {
    await _col.doc(appointment.id).update(appointment.toJson());
  }

  /// Elimina un appuntamento.
  Future<void> delete(String id) async {
    await _col.doc(id).delete();
  }
} 