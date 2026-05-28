#!/bin/bash
# ContractPulse — Aurora PostgreSQL Setup
# Run these commands in order to provision your database

# Variables (customize these)
CLUSTER_ID="contractpulse-db"
DB_NAME="contractpulse"
MASTER_USER="cpulse_admin"
MASTER_PASS="<REPLACE_WITH_SECURE_PASSWORD>"
REGION="us-east-1"
VPC_SECURITY_GROUP="<YOUR_VPC_SG_ID>"

# 1. Create Aurora PostgreSQL Serverless v2 Cluster
aws rds create-db-cluster \
  --db-cluster-identifier $CLUSTER_ID \
  --engine aurora-postgresql \
  --engine-version 15.4 \
  --master-username $MASTER_USER \
  --master-user-password $MASTER_PASS \
  --database-name $DB_NAME \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=4 \
  --vpc-security-group-ids $VPC_SECURITY_GROUP \
  --region $REGION

# 2. Create the Serverless v2 instance
aws rds create-db-instance \
  --db-instance-identifier "${CLUSTER_ID}-instance-1" \
  --db-cluster-identifier $CLUSTER_ID \
  --engine aurora-postgresql \
  --db-instance-class db.serverless \
  --region $REGION

# 3. Wait for cluster to be available
aws rds wait db-cluster-available \
  --db-cluster-identifier $CLUSTER_ID \
  --region $REGION

# 4. Get the endpoint
aws rds describe-db-clusters \
  --db-cluster-identifier $CLUSTER_ID \
  --query "DBClusters[0].Endpoint" \
  --output text \
  --region $REGION

# Your DATABASE_URL will be:
# postgresql://<MASTER_USER>:<MASTER_PASS>@<ENDPOINT>:5432/<DB_NAME>?sslmode=require
#
# Example:
# postgresql://cpulse_admin:yourpassword@contractpulse-db.cluster-xxxx.us-east-1.rds.amazonaws.com:5432/contractpulse?sslmode=require

echo ""
echo "=== IMPORTANT ==="
echo "1. Make sure your VPC security group allows inbound on port 5432"
echo "2. For Vercel access, enable public accessibility OR use Vercel's AWS integration"
echo "3. Set DATABASE_URL in your Vercel environment variables"
echo "4. Run: npx prisma db push  (to create tables)"
echo "5. Run: npm run db:seed     (to seed sample data)"
