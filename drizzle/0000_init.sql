-- Create events table
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sport_type" varchar(100) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create venues table
CREATE TABLE IF NOT EXISTS "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "events_user_id_idx" ON "events" ("user_id");
CREATE INDEX IF NOT EXISTS "events_sport_type_idx" ON "events" ("sport_type");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events" ("date");
CREATE INDEX IF NOT EXISTS "venues_event_id_idx" ON "venues" ("event_id");

-- Enable Row Level Security
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venues" ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
CREATE POLICY "Users can view their own events" ON "events"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON "events"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON "events"
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON "events"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for venues table
CREATE POLICY "Users can view venues for their events" ON "venues"
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert venues for their events" ON "venues"
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can update venues for their events" ON "venues"
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete venues for their events" ON "venues"
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));
