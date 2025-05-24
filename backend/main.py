from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import os
from datetime import datetime
import uuid
import shutil

app = FastAPI(title="Capital Runs API")

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create data directory if it doesn't exist
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

# Define models
class RunBase(BaseModel):
    business_unit: str
    product: str
    basel_event_type: str
    description: Optional[str] = None

class ActualRun(RunBase):
    run_date: str
    
class ExperimentRun(RunBase):
    experiment_name: str
    
class ScenarioRun(BaseModel):
    name: str
    business_unit: str
    product: str
    status: str = "running"  # Default status is "running"
    
class ScenarioRunUpdate(BaseModel):
    status: str

class BusinessUnit(BaseModel):
    name: str
    products: List[str] = []
    baselEventTypes: List[str] = []

# Helper function to save data to CSV
def save_to_csv(data: Dict[str, Any], file_path: str):
    # Convert to DataFrame and save
    df = pd.DataFrame([data])
    
    # Check if file exists to determine if we need to write headers
    file_exists = os.path.isfile(file_path)
    
    if file_exists:
        df.to_csv(file_path, mode='a', header=False, index=False)
    else:
        df.to_csv(file_path, index=False)
    
    return True

# Helper function to read data from CSV
def read_from_csv(file_path: str) -> List[Dict[str, Any]]:
    if not os.path.isfile(file_path):
        return []
    
    df = pd.read_csv(file_path)
    return df.to_dict('records')

# Endpoints for Actual Runs
@app.post("/api/actual-runs")
async def create_actual_run(run: ActualRun):
    try:
        # Add timestamp and ID
        run_data = run.dict()
        run_data["id"] = str(uuid.uuid4())
        run_data["created_at"] = datetime.now().isoformat()
        
        # Save to CSV
        file_path = os.path.join(DATA_DIR, "actual_runs.csv")
        save_to_csv(run_data, file_path)
        
        return {"success": True, "id": run_data["id"], "message": "Actual run created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create actual run: {str(e)}")

@app.get("/api/actual-runs")
async def get_actual_runs():
    try:
        file_path = os.path.join(DATA_DIR, "actual_runs.csv")
        runs = read_from_csv(file_path)
        return {"runs": runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve actual runs: {str(e)}")

# Endpoints for Experiment Runs
@app.post("/api/experiment-runs")
async def create_experiment_run(run: ExperimentRun):
    try:
        # Add timestamp and ID
        run_data = run.dict()
        run_data["id"] = str(uuid.uuid4())
        run_data["created_at"] = datetime.now().isoformat()
        
        # Save to CSV
        file_path = os.path.join(DATA_DIR, "experiment_runs.csv")
        save_to_csv(run_data, file_path)
        
        return {"success": True, "id": run_data["id"], "message": "Experiment run created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create experiment run: {str(e)}")

@app.get("/api/experiment-runs")
async def get_experiment_runs():
    try:
        file_path = os.path.join(DATA_DIR, "experiment_runs.csv")
        runs = read_from_csv(file_path)
        return {"runs": runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve experiment runs: {str(e)}")

@app.delete("/api/experiment-runs/{run_id}")
async def delete_experiment_run(run_id: str):
    try:
        file_path = os.path.join(DATA_DIR, "experiment_runs.csv")
        
        # Read existing data
        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="No experiment runs found")
        
        df = pd.read_csv(file_path)
        
        # Find the run by ID
        if run_id not in df['id'].values:
            raise HTTPException(status_code=404, detail=f"Experiment run with ID {run_id} not found")
        
        # Remove the run
        df = df[df['id'] != run_id]
        
        # Save back to CSV
        df.to_csv(file_path, index=False)
        
        return {"success": True, "message": f"Experiment run {run_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete experiment run: {str(e)}")

# Endpoints for Scenario Runs
@app.post("/api/scenario-runs")
async def create_scenario_run(run: ScenarioRun):
    try:
        # Add timestamp and ID
        run_data = run.dict()
        run_data["id"] = str(uuid.uuid4())
        run_data["created_at"] = datetime.now().isoformat()
        
        # Save to CSV
        file_path = os.path.join(DATA_DIR, "scenario_runs.csv")
        save_to_csv(run_data, file_path)
        
        return {"success": True, "id": run_data["id"], "message": "Scenario run created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create scenario run: {str(e)}")

@app.get("/api/scenario-runs")
async def get_scenario_runs():
    try:
        file_path = os.path.join(DATA_DIR, "scenario_runs.csv")
        runs = read_from_csv(file_path)
        return {"runs": runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve scenario runs: {str(e)}")

@app.put("/api/scenario-runs/{run_id}")
async def update_scenario_run(run_id: str, update: ScenarioRunUpdate):
    try:
        file_path = os.path.join(DATA_DIR, "scenario_runs.csv")
        
        # Read existing data
        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="No scenario runs found")
        
        df = pd.read_csv(file_path)
        
        # Find the run by ID
        if run_id not in df['id'].values:
            raise HTTPException(status_code=404, detail=f"Scenario run with ID {run_id} not found")
        
        # Update the status
        df.loc[df['id'] == run_id, 'status'] = update.status
        
        # Save back to CSV
        df.to_csv(file_path, index=False)
        
        return {"success": True, "message": f"Scenario run {run_id} updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update scenario run: {str(e)}")

# Business Units, Products, and Basel Event Types endpoints
@app.get("/api/business-units")
async def get_business_units():
    try:
        # Check if we have a business_units.csv file
        file_path = os.path.join(DATA_DIR, "business_units.csv")
        if os.path.isfile(file_path):
            df = pd.read_csv(file_path)
            return {"business_units": df['name'].tolist()}
        
        # If no file exists, return hardcoded values
        return {
            "business_units": [
                "CFs", "CIB", "PBB"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve business units: {str(e)}")

@app.post("/api/business-units")
async def create_business_unit(business_unit: BusinessUnit):
    try:
        # Create business_units.csv if it doesn't exist
        file_path = os.path.join(DATA_DIR, "business_units.csv")
        
        if os.path.isfile(file_path):
            # Read existing data
            df = pd.read_csv(file_path)
            
            # Check if business unit already exists
            if business_unit.name in df['name'].values:
                return {"success": True, "message": f"Business unit {business_unit.name} already exists"}
            
            # Add new business unit
            new_df = pd.DataFrame([{"name": business_unit.name}])
            df = pd.concat([df, new_df], ignore_index=True)
        else:
            # Create new file with this business unit
            df = pd.DataFrame([{"name": business_unit.name}])
        
        # Save to CSV
        df.to_csv(file_path, index=False)
        
        # If products are provided, save them to products.csv
        if business_unit.products:
            products_file = os.path.join(DATA_DIR, "products.csv")
            products_data = []
            
            for product in business_unit.products:
                products_data.append({
                    "business_unit": business_unit.name,
                    "product": product
                })
            
            products_df = pd.DataFrame(products_data)
            
            if os.path.isfile(products_file):
                existing_df = pd.read_csv(products_file)
                products_df = pd.concat([existing_df, products_df], ignore_index=True)
            
            products_df.to_csv(products_file, index=False)
        
        # If basel event types are provided, save them to basel_event_types.csv
        if business_unit.baselEventTypes:
            basel_file = os.path.join(DATA_DIR, "basel_event_types.csv")
            basel_data = []
            
            for event_type in business_unit.baselEventTypes:
                basel_data.append({
                    "business_unit": business_unit.name,
                    "basel_event_type": event_type
                })
            
            basel_df = pd.DataFrame(basel_data)
            
            if os.path.isfile(basel_file):
                existing_df = pd.read_csv(basel_file)
                basel_df = pd.concat([existing_df, basel_df], ignore_index=True)
            
            basel_df.to_csv(basel_file, index=False)
        
        return {"success": True, "message": f"Business unit {business_unit.name} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create business unit: {str(e)}")

@app.get("/api/products")
async def get_products(business_unit: Optional[str] = None):
    try:
        # Check if we have a products.csv file
        file_path = os.path.join(DATA_DIR, "products.csv")
        
        if os.path.isfile(file_path):
            df = pd.read_csv(file_path)
            
            if business_unit:
                # Filter by business unit
                filtered_df = df[df['business_unit'] == business_unit]
                return {"products": filtered_df['product'].tolist()}
            else:
                # Return all unique products
                return {"products": df['product'].unique().tolist()}
        
        # If no file exists or no products found, return hardcoded values
        products = {
            "CFs": ["Business Enablers"],
            "CIB": ["Business Enabler", "Global Markets", "Investment Banking", "TPS"],
            "PBB": ["Transactional", "Lending", "VAF", "HL", "Card", "SBFC", "W&I", "Cash"]
        }
        
        if business_unit and business_unit in products:
            return {"products": products[business_unit]}
        
        # If no business unit specified or invalid, return all products
        all_products = []
        for product_list in products.values():
            all_products.extend(product_list)
        
        return {"products": list(set(all_products))}  # Remove duplicates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve products: {str(e)}")

@app.get("/api/basel-event-types")
async def get_basel_event_types(business_unit: Optional[str] = None):
    try:
        # Check if we have a basel_event_types.csv file
        file_path = os.path.join(DATA_DIR, "basel_event_types.csv")
        
        if os.path.isfile(file_path):
            df = pd.read_csv(file_path)
            
            if business_unit:
                # Filter by business unit
                filtered_df = df[df['business_unit'] == business_unit]
                return {"basel_event_types": filtered_df['basel_event_type'].tolist()}
            else:
                # Return all unique basel event types
                return {"basel_event_types": df['basel_event_type'].unique().tolist()}
        
        # If no file exists, return hardcoded values
        basel_event_types = {
            "CFs": ["DTPA", "EPWS", "EDPM - FIFC", "CPBP", "IF", "EDPM - TAX", "EF"],
            "CIB": ["BDSF", "IF", "CPBP", "EDPM", "EF"],
            "PBB": ["BDSF", "EDPM", "EF", "IF", "CPBP"]
        }
        
        if business_unit and business_unit in basel_event_types:
            return {"basel_event_types": basel_event_types[business_unit]}
        
        # Return all basel event types
        all_types = []
        for type_list in basel_event_types.values():
            all_types.extend(type_list)
        
        return {"basel_event_types": list(set(all_types))}  # Remove duplicates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve Basel event types: {str(e)}")

@app.post("/api/reset-data")
async def reset_data():
    try:
        # Delete all CSV files in the data directory
        for file_name in os.listdir(DATA_DIR):
            if file_name.endswith('.csv'):
                file_path = os.path.join(DATA_DIR, file_name)
                os.remove(file_path)
        
        # Create default business units, products, and basel event types
        business_units = ["CFs", "CIB", "PBB"]
        products = {
            "CFs": ["Business Enablers"],
            "CIB": ["Business Enabler", "Global Markets", "Investment Banking", "TPS"],
            "PBB": ["Transactional", "Lending", "VAF", "HL", "Card", "SBFC", "W&I", "Cash"]
        }
        basel_event_types = {
            "CFs": ["DTPA", "EPWS", "EDPM - FIFC", "CPBP", "IF", "EDPM - TAX", "EF"],
            "CIB": ["BDSF", "IF", "CPBP", "EDPM", "EF"],
            "PBB": ["BDSF", "EDPM", "EF", "IF", "CPBP"]
        }
        
        # Create business_units.csv
        bu_df = pd.DataFrame({"name": business_units})
        bu_df.to_csv(os.path.join(DATA_DIR, "business_units.csv"), index=False)
        
        # Create products.csv
        products_data = []
        for bu, prod_list in products.items():
            for prod in prod_list:
                products_data.append({
                    "business_unit": bu,
                    "product": prod
                })
        pd.DataFrame(products_data).to_csv(os.path.join(DATA_DIR, "products.csv"), index=False)
        
        # Create basel_event_types.csv
        basel_data = []
        for bu, type_list in basel_event_types.items():
            for event_type in type_list:
                basel_data.append({
                    "business_unit": bu,
                    "basel_event_type": event_type
                })
        pd.DataFrame(basel_data).to_csv(os.path.join(DATA_DIR, "basel_event_types.csv"), index=False)
        
        return {"success": True, "message": "All data has been reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset data: {str(e)}")

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...), business_unit: str = None):
    try:
        if not business_unit:
            raise HTTPException(status_code=400, detail="Business unit is required")
        
        # Create a temporary file
        temp_file = os.path.join(DATA_DIR, "temp.csv")
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Read the CSV file
        df = pd.read_csv(temp_file)
        
        # Validate required columns
        required_columns = ["product", "basel_event_type", "1in2", "1in5", "1in10", "1in20"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            os.remove(temp_file)
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process each row and create experiment runs
        experiment_runs = []
        for _, row in df.iterrows():
            run_data = {
                "id": str(uuid.uuid4()),
                "business_unit": business_unit,
                "product": row["product"],
                "basel_event_type": row["basel_event_type"],
                "experiment_name": f"CSV Upload - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "created_at": datetime.now().isoformat(),
                "1in2": row["1in2"],
                "1in5": row["1in5"],
                "1in10": row["1in10"],
                "1in20": row["1in20"]
            }
            experiment_runs.append(run_data)
        
        # Save to experiment_runs.csv
        file_path = os.path.join(DATA_DIR, "experiment_runs.csv")
        
        if os.path.isfile(file_path):
            # Append to existing file
            existing_df = pd.read_csv(file_path)
            new_df = pd.DataFrame(experiment_runs)
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            combined_df.to_csv(file_path, index=False)
        else:
            # Create new file
            pd.DataFrame(experiment_runs).to_csv(file_path, index=False)
        
        # Clean up
        os.remove(temp_file)
        
        return {
            "success": True, 
            "message": f"Successfully processed {len(experiment_runs)} experiment runs from CSV",
            "runs_created": len(experiment_runs)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
