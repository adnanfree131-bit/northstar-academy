DELETE FROM exam_subjects;
DELETE FROM exams;
DELETE FROM fee_components;
DELETE FROM fee_invoices;
DELETE FROM guardians;
DELETE FROM notes;
DELETE FROM documents;
DELETE FROM staff;
DELETE FROM students;
DELETE FROM audit_log;

INSERT INTO students VALUES
('stu-001','ADM-2024-0142','Ayesha','Khan','Ayesha Khan','Female','2012-03-14','8','A','12','active','2020-04-02','B+','Peanuts','Route-03',0,NULL,NULL,'stu-014',12500,94.2,datetime('now')),
('stu-002','ADM-2023-0087','Hassan','Ali','Hassan Ali','Male','2011-11-22','9','B','05','active','2019-03-15','O+',NULL,'Route-01',0,'Asthma – carry inhaler',NULL,'',0,88.7,datetime('now')),
('stu-003','ADM-2025-0031','Zainab','Raza','Zainab Raza','Female','2013-07-08','7','A','19','active','2021-04-10','A+',NULL,NULL,1,NULL,'Mild dyslexia – extra time on written exams','',34200,96.5,datetime('now')),
('stu-004','ADM-2022-0199','Bilal','Ahmed','Bilal Ahmed','Male','2010-01-30','10','A','03','active','2018-04-05','AB+',NULL,'Route-05',0,NULL,NULL,'stu-009',8750,91.3,datetime('now')),
('stu-005','ADM-2024-0211','Fatima','Noor','Fatima Noor','Female','2012-09-17','8','B','07','suspended','2020-04-12','B-',NULL,NULL,0,NULL,NULL,'',45600,72.1,datetime('now')),
('stu-006','ADM-2024-0308','Omar','Siddiqui','Omar Siddiqui','Male','2012-06-21','8','A','18','active','2020-04-08','O-','Dust','Route-03',0,'Seasonal asthma',NULL,'',0,97.1,datetime('now')),
('stu-007','ADM-2021-0110','Maryam','Iftikhar','Maryam Iftikhar','Female','2009-12-02','10','B','01','active','2017-04-03','A+',NULL,NULL,1,NULL,NULL,'',15200,89.4,datetime('now'));

INSERT INTO guardians VALUES
('g1','stu-001','Imran Khan','Father','+92 300 1234567','imran.khan@email.com',1,'Engineer'),
('g2','stu-001','Sana Khan','Mother','+92 321 7654321',NULL,0,NULL),
('g3','stu-002','Tariq Ali','Father','+92 333 9876543',NULL,1,'Business'),
('g4','stu-003','Faisal Raza','Father','+92 345 1122334',NULL,1,NULL),
('g5','stu-003','Nadia Raza','Mother','+92 300 5566778',NULL,0,NULL),
('g6','stu-004','Kamran Ahmed','Father','+92 312 3344556',NULL,1,'Doctor'),
('g7','stu-005','Asif Noor','Father','+92 321 9988776',NULL,1,NULL),
('g8','stu-006','Rashid Siddiqui','Father','+92 300 2223344','rashid.s@email.com',1,'Banker'),
('g9','stu-007','Iftikhar Hussain','Father','+92 333 1112233',NULL,1,'Lawyer');

INSERT INTO fee_invoices VALUES
('inv-1001','stu-001','Ayesha Khan','8-A','2025-26','Term 1',40000,27500,'2026-04-15','partial',0,0,NULL,'2026-03-28',NULL),
('inv-1002','stu-002','Hassan Ali','9-B','2025-26','Term 1',40500,40500,'2026-04-15','paid',0,0,NULL,'2026-04-02','RCP-88421'),
('inv-1003','stu-003','Zainab Raza','7-A','2025-26','Term 1',75000,40800,'2026-03-31','overdue',2500,5000,'Sibling concession (partial)',NULL,NULL),
('inv-1004','stu-005','Fatima Noor','8-B','2025-26','Term 1',40000,0,'2026-02-28','overdue',5600,0,NULL,NULL,NULL),
('inv-1005','stu-007','Maryam Iftikhar','10-B','2025-26','Term 1',45500,30300,'2026-04-10','partial',0,0,NULL,'2026-04-01',NULL);

INSERT INTO fee_components VALUES
('c1','inv-1001','Tuition Fee',28000,'tuition'),
('c2','inv-1001','Transport',8500,'transport'),
('c3','inv-1001','Lab Fee',3500,'lab'),
('c4','inv-1002','Tuition Fee',32000,'tuition'),
('c5','inv-1002','Transport',8500,'transport'),
('c6','inv-1003','Tuition Fee',26000,'tuition'),
('c7','inv-1003','Hostel Fee',45000,'hostel'),
('c8','inv-1003','Activity Fee',4000,'activity'),
('c9','inv-1004','Tuition Fee',28000,'tuition'),
('c10','inv-1004','Transport',8500,'transport'),
('c11','inv-1004','Lab Fee',3500,'lab'),
('c12','inv-1005','Tuition Fee',35000,'tuition'),
('c13','inv-1005','Exam Fee',4500,'exam'),
('c14','inv-1005','Lab Fee',6000,'lab');

INSERT INTO staff VALUES
('stf-01','EMP-001','Dr. Sara Malik','Principal',NULL,NULL,'sara.malik@school.edu','+92 300 1112233','active','2015-08-01',20,''),
('stf-02','EMP-014','Mr. Usman Sheikh','Teacher','Science','Physics,Chemistry','usman.sheikh@school.edu','+92 321 4445566','active','2019-03-12',28,'9-A,9-B,10-A'),
('stf-03','EMP-022','Ms. Hina Qureshi','Teacher','Mathematics','Mathematics','hina.qureshi@school.edu','+92 333 7778899','on-leave','2021-01-20',24,'7-A,8-A,8-B'),
('stf-04','EMP-008','Mr. Khalid Mehmood','Accountant',NULL,NULL,'khalid.mehmood@school.edu','+92 345 2223344','active','2017-06-01',40,''),
('stf-05','EMP-031','Ms. Fatima Zahra','Teacher','English','English','fatima.zahra@school.edu','+92 300 5556677','active','2022-08-15',26,'8-A,8-B,9-A');

INSERT INTO exams VALUES
('ex-01','Mid-Term Examination 2026','mid-term','All','2026-05-12','2026-05-23','upcoming'),
('ex-02','Unit Test 3 – Class 10','unit','10','2026-04-08','2026-04-10','completed');

INSERT INTO exam_subjects (exam_id, name, max_marks, date) VALUES
('ex-01','English',100,'2026-05-12'),
('ex-01','Mathematics',100,'2026-05-14'),
('ex-01','Science',100,'2026-05-16'),
('ex-01','Urdu',75,'2026-05-19'),
('ex-01','Islamiat',50,'2026-05-21'),
('ex-02','Physics',50,'2026-04-08'),
('ex-02','Chemistry',50,'2026-04-09'),
('ex-02','Mathematics',50,'2026-04-10');

INSERT INTO notes VALUES
('note-01','stu-003','SEN exam accommodation','Extra 25% time on written papers. Invigilators must be notified automatically.','sen',1,1,'Dr. Sara Malik','2026-03-12 09:00:00'),
('note-02','stu-005','Suspension review','Fee default + attendance 72.1%. Review scheduled with primary guardian.','discipline',1,1,'Dr. Sara Malik','2026-08-10 11:20:00'),
('note-03','stu-002','Medical protocol','Asthma — student must keep inhaler. PE teacher informed.','medical',1,0,'Ms. Fatima Zahra','2026-04-02 08:15:00'),
('note-04',NULL,'Mid-term hall plan','Halls 1–3 assigned. SEN extra-time room is Lab-2.','academic',0,1,'Dr. Sara Malik','2026-08-20 16:00:00'),
('note-05','stu-001','Sibling discount check','Linked sibling stu-014 — confirm cascading concession before Term 2 invoice.','finance',0,0,'Mr. Khalid Mehmood','2026-08-18 10:40:00');

INSERT INTO documents VALUES
('doc-01','stu-001','Birth Certificate','verified',NULL,'2020-04-02'),
('doc-02','stu-001','Previous School TC','verified',NULL,'2020-03-28'),
('doc-03','stu-003','Medical Fitness Certificate','verified',NULL,'2025-03-15'),
('doc-04','stu-005','Suspension notice','pending',NULL,'2026-08-10');

INSERT INTO audit_log (action, entity, entity_id, detail) VALUES
('seed','system',NULL,'Initial D1 seed loaded'),
('suspend','student','stu-005','Suspended for fee default and low attendance');
